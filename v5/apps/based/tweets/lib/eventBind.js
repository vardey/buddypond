// eventBind.js
export default function eventBind(renderType, tweetsWindow) {
  const MAX_CHARS = 280;
  const holder = $('.tweets-holder', tweetsWindow.content);

  // --- Circular character counter setup ---
  function setupCharCounter(inputEl, container) {
    if (container.find('.tweets-char-count').length === 0) {
      container.prepend(`
        <div class="tweets-char-count" title="Character count">
          <svg width="40" height="40">
            <circle class="bg" r="18" cx="20" cy="20" stroke="#eee" stroke-width="3" fill="none"/>
            <circle class="progress" r="18" cx="20" cy="20" stroke="#1DA1F2" stroke-width="3" fill="none"
              stroke-dasharray="${2 * Math.PI * 18}" stroke-dashoffset="${2 * Math.PI * 18}"
              stroke-linecap="round"/>
          </svg>
        </div>
      `);
    }

    const circle = container.find('.progress');
    const radius = 18;
    const circumference = 2 * Math.PI * radius;

    inputEl.on('input', () => {
      const len = inputEl.val().length;
      const percent = Math.min(len / MAX_CHARS, 1);
      const offset = circumference - percent * circumference;

      circle.css('stroke-dashoffset', offset);
      circle.css('stroke', len > MAX_CHARS ? 'red' : '#1DA1F2');
    });
  }

  // --- Helpers ---
  async function handleCreatePost({ client, tweetsWindow, renderType }) {
    const input = $('.tweets-input', tweetsWindow.content);
    const errorEl = $('.tweets-error', tweetsWindow.content);
    const content = input.val();

    errorEl.text('');

    if (content.length > MAX_CHARS) {
      errorEl.text(`Post too long! Max ${MAX_CHARS} characters.`);
      return;
    }

    try {
      await client.apiRequest('/posts', 'POST', {
        userId: buddypond.me,
        content
      });
      input.val('');
      await this.render(buddypond.me, renderType, tweetsWindow);
    } catch (err) {
      console.error('Error creating post:', err);
      errorEl.text(`Error: ${err.message}`);
    }
  }

  async function createReplyPost({ client, tweetsWindow, renderType, tweetId, content }) {
    if (!content) return;
    if (content.length > MAX_CHARS) throw new Error(`Reply too long! Max ${MAX_CHARS} characters.`);

    await client.apiRequest(`/posts/${tweetId}/replies`, 'POST', {
      userId: buddypond.me,
      content
    });
    await this.render(buddypond.me, renderType, tweetsWindow);
  }

  // --- Delegated events from .tweets-holder ---
  holder.on('click', '.tweets-button', async (e) => {
    e.preventDefault();
    await handleCreatePost.call(this, { client: this.client, tweetsWindow, renderType });
  });

  holder.on('keypress', '.tweets-input', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleCreatePost.call(this, { client: this.client, tweetsWindow, renderType });
    }
  });

  holder.on('click', '.tweets-delete', async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this tweet?')) return;

    const tweetId = $(e.target).data('id');
    await this.client.apiRequest(`/posts/${tweetId}`, 'DELETE');
    // remove the tweet from the DOM immediately
    $(`[data-tweet="${tweetId}"]`, tweetsWindow.content).remove();
    //await this.render(buddypond.me, renderType, tweetsWindow);
  });

  holder.on('click', '.tweets-like', async (e) => {
    e.preventDefault();
    const tweetId = $(e.target).data('id');
    await this.client.apiRequest(`/posts/${tweetId}/likes`, 'POST', { userId: buddypond.me });
    await this.render(buddypond.me, renderType, tweetsWindow);
  });

  holder.on('click', '.tweets-retweet', async (e) => {
    e.preventDefault();
    const tweetId = $(e.target).data('id');
    await this.client.apiRequest(`/posts/${tweetId}/repost`, 'POST', { userId: buddypond.me });
    await this.render(buddypond.me, renderType, tweetsWindow);
  });

  holder.on('click', '.tweets-reply', async (e) => {
    e.preventDefault();
    const tweetId = $(e.target).data('id');

    $('.tweets-reply-modal').remove();

    const tweetData = await this.client.apiRequest(`/posts/${tweetId}?reply_count=1`);
    const originalPostHtml = this.renderTweet(tweetData, tweetsWindow, { noToolbar: true });

    const modal = $(`
      <div class="tweets-reply-modal">
        <div class="tweets-reply-modal-content desktop-section">
          <div class="tweets-reply-modal-header">
            <h3>Reply</h3>
            <span class="tweets-reply-modal-close">&times;</span>
          </div>
          <div class="tweets-reply-modal-original">${originalPostHtml}</div>
          <textarea class="tweets-reply-modal-input" placeholder="Write your reply..."></textarea>
          <div class="tweets-error"></div>
          <div class="tweets-composer-controls">
            <div class="tweets-char-counter"></div>
            <button class="tweets-reply-modal-submit">Reply</button>
          </div>
        </div>
      </div>
    `);

    $('body').append(modal);
    const input = modal.find('.tweets-reply-modal-input');
    input.focus();

    // setup counter for reply
    setupCharCounter(input, modal.find('.tweets-char-counter'));

    modal.find('.tweets-reply-modal-close').on('click', () => modal.remove());

    async function submitReply() {
      const replyContent = input.val().trim();
      if (!replyContent) return;

      const errorEl = modal.find('.tweets-error');
      errorEl.text('');

      try {
        await createReplyPost.call(this, {
          client: this.client,
          tweetsWindow,
          renderType,
          tweetId,
          content: replyContent
        });
        modal.remove();
      } catch (err) {
        errorEl.text(`Error: ${err.message}`);
      }
    }

    modal.find('.tweets-reply-modal-submit').on('click', submitReply.bind(this));
    input.on('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitReply.call(this);
      }
    });
  });

  // --- Setup main composer counter once ---
  setupCharCounter($('.tweets-input', tweetsWindow.content), $('.tweets-composer-controls', tweetsWindow.content));
}
