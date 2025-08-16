export default function eventBind(renderType, tweetsWindow) {
  // Create new post
  $('.tweets-button', tweetsWindow.content).on('click', async (e) => {
    e.preventDefault();
    await this.client.apiRequest('/posts', 'POST', {
      userId: buddypond.me,
      content: $('.tweets-input', tweetsWindow.content).val()
    });

    // empty the input
    $('.tweets-input', tweetsWindow.content).val('');

    // re-render the tweets
    await this.render(buddypond.me, renderType, tweetsWindow);
    this.eventBind(renderType, tweetsWindow);
  });

  // enter key in textarea also creates post
  $('.tweets-input', tweetsWindow.content).on('keypress', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
     $('.tweets-error', tweetsWindow.content).text('');

      try {
        await this.client.apiRequest('/posts', 'POST', {
          userId: buddypond.me,
          content: $('.tweets-input', tweetsWindow.content).val()
        });

      } catch (err) {
        console.error('Error creating post:', err);
        $('.tweets-error', tweetsWindow.content).text(`Error: ${err.message}`);
        return;
      }


      // empty the input
      $('.tweets-input', tweetsWindow.content).val('');

      // re-render the tweets
      await this.render(buddypond.me, renderType, tweetsWindow);
      this.eventBind(renderType, tweetsWindow);
    }
  });

  // Delete post
  $('.tweets-delete', tweetsWindow.content).on('click', async (e) => {
    e.preventDefault();
    let confirmed = confirm('Are you sure you want to delete this tweet?');
    if (!confirmed) return;
    const tweetId = $(e.target).data('id');
    await this.client.apiRequest(`/posts/${tweetId}`, 'DELETE');
    // re-render the tweets
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

    // re-render to update like counts
    await this.render(buddypond.me, renderType, tweetsWindow);
    this.eventBind(renderType, tweetsWindow);
  });

  // Repost (retweet)
  $('.tweets-retweet', tweetsWindow.content).on('click', async (e) => {
    e.preventDefault();
    const tweetId = $(e.target).data('id');

    await this.client.apiRequest(`/posts/${tweetId}/repost`, 'POST', {
      userId: buddypond.me
    });

    // re-render to show reposts
    await this.render(buddypond.me, renderType, tweetsWindow);
    this.eventBind(renderType, tweetsWindow);
  });


  // Reply (modal style)
  $('.tweets-reply', tweetsWindow.content).on('click', async (e) => {
    e.preventDefault();
    const tweetId = $(e.target).data('id');
    const tweetDiv = $(e.target).closest('.tweets-post');

    // Remove any existing modal first
    $('.tweets-reply-modal').remove();

    // Clone the original tweet HTML using your renderTweet function
    const tweetData = await this.client.apiRequest(`/posts/${tweetId}?reply_count=1`);
    const originalPostHtml = this.renderTweet(tweetData, {
      noToolbar: true,

    });

    // Create modal overlay
    const modal = $(`
    <div class="tweets-reply-modal">
      <div class="tweets-reply-modal-content desktop-section">
        <div class="tweets-reply-modal-header">
          <h3>Reply</h3>
          <span class="tweets-reply-modal-close">&times;</span>
        </div>
        <div class="tweets-reply-modal-original">${originalPostHtml}</div>
        <textarea class="tweets-reply-modal-input" placeholder="Write your reply..."></textarea>
        <button class="tweets-reply-modal-submit">Reply</button>
      </div>
    </div>
  `);

    // Append modal to body
    $('body').append(modal);

    // Close modal
    modal.find('.tweets-reply-modal-close').on('click', () => modal.remove());

    // Handle submit
    modal.find('.tweets-reply-modal-submit').on('click', async () => {
      const replyContent = modal.find('.tweets-reply-modal-input').val().trim();
      if (!replyContent) return;

      await this.client.apiRequest(`/posts/${tweetId}/replies`, 'POST', {
        userId: buddypond.me,
        content: replyContent
      });

      // Remove modal after posting
      modal.remove();

      // Re-render tweets to show the new reply
      await this.render(buddypond.me, renderType, tweetsWindow);
      this.eventBind(renderType, tweetsWindow);
    });
  });


}
