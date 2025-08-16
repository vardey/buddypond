export default function eventBind(renderType, tweetsWindow) {
  const MAX_CHARS = 280;

  // --- Circular character counter setup ---
  function setupCharCounter(inputEl, container) {
    // Add counter SVG if not present
    console.log('Setting up char counter', (container.find('.tweets-char-count')))
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

      if (len > MAX_CHARS) {
        circle.css('stroke', 'red');
      } else {
        circle.css('stroke', '#1DA1F2');
      }
    });
  }

  // Common helper for creating a post
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
      this.eventBind(renderType, tweetsWindow);
    } catch (err) {
      console.error('Error creating post:', err);
      errorEl.text(`Error: ${err.message}`);
    }
  }

  // --- Helper: createReplyPost ---
  async function createReplyPost({ client, tweetsWindow, renderType, tweetId, content }) {
    if (!content) return;
    if (content.length > MAX_CHARS) {
      throw new Error(`Reply too long! Max ${MAX_CHARS} characters.`);
    }

    try {
      await client.apiRequest(`/posts/${tweetId}/replies`, 'POST', {
        userId: buddypond.me,
        content
      });

      await this.render(buddypond.me, renderType, tweetsWindow);
      this.eventBind(renderType, tweetsWindow);
    } catch (err) {
      console.error('Error creating reply:', err);
      throw err;
    }
  }

  // Create new post on button click
  $('.tweets-button', tweetsWindow.content).on('click', async (e) => {
    e.preventDefault();
    await handleCreatePost.call(this, { client: this.client, tweetsWindow, renderType });
  });

  // Enter key in textarea also creates post
  $('.tweets-input', tweetsWindow.content).on('keypress', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleCreatePost.call(this, { client: this.client, tweetsWindow, renderType });
    }
  });

  // Setup character counter for main composer
  setupCharCounter($('.tweets-input', tweetsWindow.content), $('.tweets-composer-controls', tweetsWindow.content));

  // Delete post
  $('.tweets-delete', tweetsWindow.content).on('click', async (e) => {
    e.preventDefault();
    let confirmed = confirm('Are you sure you want to delete this tweet?');
    if (!confirmed) return;
    const tweetId = $(e.target).data('id');
    await this.client.apiRequest(`/posts/${tweetId}`, 'DELETE');
    await this.render(buddypond.me, renderType, tweetsWindow);
    this.eventBind(renderType, tweetsWindow);
  });

  // Like post
  $('.tweets-like', tweetsWindow.content).on('click', async (e) => {
    e.preventDefault();
    const tweetId = $(e.target).data('id');

    await this.client.apiRequest(`/posts/${tweetId}/likes`, 'POST', {
      userId: buddypond.me
    });

    await this.render(buddypond.me, renderType, tweetsWindow);
    this.eventBind(renderType, tweetsWindow);
  });

  // Repost
  $('.tweets-retweet', tweetsWindow.content).on('click', async (e) => {
    e.preventDefault();
    const tweetId = $(e.target).data('id');

    await this.client.apiRequest(`/posts/${tweetId}/repost`, 'POST', {
      userId: buddypond.me
    });

    await this.render(buddypond.me, renderType, tweetsWindow);
    this.eventBind(renderType, tweetsWindow);
  });

  // --- Reply (modal style) ---
  $('.tweets-reply', tweetsWindow.content).on('click', async (e) => {
    e.preventDefault();
    const tweetId = $(e.target).data('id');

    $('.tweets-reply-modal').remove();

    const tweetData = await this.client.apiRequest(`/posts/${tweetId}?reply_count=1`);
    const originalPostHtml = this.renderTweet(tweetData, { noToolbar: true });

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
  `);

    $('body').append(modal);
    const input = modal.find('.tweets-reply-modal-input');
    input.focus();

    // Setup character counter for reply
    setupCharCounter(input, modal.find('.tweets-char-counter'));

    modal.find('.tweets-reply-modal-close').on('click', () => modal.remove());

    modal.find('.tweets-reply-modal-submit').on('click', async () => {
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
      } catch (err) {
        errorEl.text(`Error: ${err.message}`);
        return;
      }

      modal.remove();
    });

    input.on('keypress', async (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const replyContent = input.val().trim();
        if (!replyContent) return;

        try {
          await createReplyPost.call(this, {
            client: this.client,
            tweetsWindow,
            renderType,
            tweetId,
            content: replyContent
          });
        } catch (err) {
          modal.find('.tweets-error').text(`Error: ${err.message}`);
          return;
        }

        modal.remove();
      }
    });
  });
}
