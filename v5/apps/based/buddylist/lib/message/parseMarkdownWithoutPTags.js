// Function to remove outer <p> tags
export default function parseMarkdownWithoutPTags(markdown) {
  if (!markdown) return ''; // empty text


  if (isEmojiOnly(markdown)) {
    return renderBigEmojiHTML(markdown);
  }

  // Supported colors and styles
  const supportedColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'white', 'gray', 'cyan', 'magenta', 'pink'];
  const supportedStyles = ['bold', 'italic', 'underline', 'strike', 'blink', 'reverse', 'hidden', 'dim', 'rainbow'];

  // Custom renderer for links to add target="_blank"
  const linkExtension = {
    name: 'link',
    level: 'inline',
    renderer(token) {
      // Ensure href is properly encoded
      const href = token.href.replace(/"/g, '&quot;');
      // Add target="_blank" and rel="noopener" for security
      return `<a href="${href}" target="_blank" rel="noopener">${this.parser.parseInline(token.tokens)}</a>`;
    }
  };

  const styleExtension = {
    name: 'style',
    level: 'inline',

    tokenizer(src) {
      const match = /^((?:\w+\.)*\w+)\(\s*([\s\S]+?)\s*\)/.exec(src);
      if (match) {
        const raw = match[0];
        const modifiers = match[1].split('.');
        const text = match[2];

        const isValid = modifiers.every(mod => supportedColors.includes(mod) || supportedStyles.includes(mod));
        if (!isValid) return;

        return {
          type: 'style',
          raw,
          modifiers,
          text,
          tokens: this.lexer.inlineTokens(text)
        };
      }
    },
    renderer(token) {
      let content = this.parser.parseInline(token.tokens);

      // Apply modifiers in reverse order to maintain proper nesting
      token.modifiers.reverse().forEach(mod => {
        if (supportedColors.includes(mod)) {
          content = `<span class="message-decoration-color-${mod}">${content}</span>`;
        } else if (mod === 'bold') {
          content = `<strong class="message-decoration-bold">${content}</strong>`;
        } else if (mod === 'italic') {
          content = `<em class="message-decoration-italic">${content}</em>`;
        } else if (mod === 'underline') {
          content = `<u class="message-decoration-underline">${content}</u>`;
        } else if (mod === 'strike') {
          content = `<s class="message-decoration-strike">${content}</s>`;
        } else if (mod === 'blink') {
          content = `<span class="message-decoration-blink">${content}</span>`;
        } else if (mod === 'reverse') {
          content = content.split('').reverse().join('');
        } else if (mod === 'hidden') {
          content = `<span class="message-decoration-hidden">${content}</span>`;
        } else if (mod === 'dim') {
          content = `<span class="message-decoration-dim">${content}</span>`;
        } else if (mod === 'rainbow') {
          content = `<span class="message-decoration-rainbow">${content}</span>`;
        }
      });

      return content;
    },


    walkTokens(token) {
      if (token.type === 'style') {
        console.log(`Detected style token: ${token.modifiers.join('.')}`);
      }
    }
  };

  marked.use({ extensions: [styleExtension, linkExtension] });

  let html;
  try {
    html = marked.parse(markdown);
  } catch (error) {
    html = markdown;
  }

  // register the hook once at module init
  if (!DOMPurify.__added_anchor_hook) {
    DOMPurify.addHook('afterSanitizeAttributes', function (node) {
      // only run for <a>
      if (node.tagName && node.tagName.toLowerCase() === 'a') {
        const href = node.getAttribute('href') || '';

        // Validate URL scheme (same rules as ALLOWED_URI_REGEXP)
        try {
          const url = new URL(href, 'https://example.com'); // base for relative URLs
          if (!/^(https?:|mailto:|tel:)/i.test(url.protocol)) {
            // Disallow link entirely (or remove href)
            node.removeAttribute('href');
            node.removeAttribute('target');
            node.removeAttribute('rel');
            return;
          }
        } catch (e) {
          // malformed -> remove
          node.removeAttribute('href');
          node.removeAttribute('target');
          node.removeAttribute('rel');
          return;
        }

        // Ensure anchors open safely in a new tab
        // We force _blank and ensure rel contains noopener noreferrer
        node.setAttribute('target', '_blank');

        const existing = (node.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
        if (!existing.includes('noopener')) existing.push('noopener');
        if (!existing.includes('noreferrer')) existing.push('noreferrer');
        node.setAttribute('rel', existing.join(' '));
      }
    });
    DOMPurify.__added_anchor_hook = true;
  }

  // sanitize: allow the tags/attrs you need, and restrict allowed URI schemes
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'a', 'span', 'strong', 'em', 'u', 's', 'div', 'br', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'data-char-index', 'src'
    ],
    FORCE_BODY: true,
    KEEP_CONTENT: true,
    SANITIZE_DOM: true,
    // RETURN_TRUSTED_TYPE: true, // progressive support for supporting Trusted Types, works when available
    // this will return DOM if supported, otherwise returns string, TODO: would need to handle both cases
    // allow only http(s), mailto, tel for href/src
    ALLOWED_URI_REGEXP: /^(?:(https?|mailto|tel):|\/)/i
  });

  return clean.replace(/^<p>(.*?)<\/p>\s*$/s, '$1');
  // Explanation:
  // ^<p>       → Matches the opening <p> at the start
  // (.*?)      → Captures the content inside (non-greedy)
  // <\/p>\s*$  → Matches the closing </p> with optional trailing whitespace
  // $1         → Returns only the captured content
}

// Shared helper: Split emoji-aware graphemes
function splitEmojiGraphemes(text) {
  const splitter = new GraphemeSplitter();
  return splitter.splitGraphemes(text.trim());
}

// Strip variation selector (U+FE0F) for matching against EMOJIS
function normalizeEmoji(str) {
  return str.replace(/\uFE0F/g, '');
}

function isEmojiOnly(text) {
  if (!text) return false;

  // if text is longer than 7 length, return false immediately
  if (text.length > 7) return false;

  const graphemes = splitEmojiGraphemes(text);
  const emojiList = new Set(Object.keys(EMOJIS));

  const emojis = graphemes.filter(g =>
    emojiList.has(g) || emojiList.has(normalizeEmoji(g))
  );

  return emojis.length > 0 &&
    emojis.length <= 7 &&
    emojis.join('') === text.trim();
}

// Render big emoji HTML
function renderBigEmojiHTML(text) {
  const graphemes = splitEmojiGraphemes(text);
  return `<div class="emoji-only">` +
    graphemes.map(g => `<span class="big-emoji">${g}</span>`).join('') +
    `</div>`;
}