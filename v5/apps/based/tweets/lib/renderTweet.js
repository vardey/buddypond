
export default function renderTweet(tweet, options = {}) {

  let showReplyButton = true;
  let replyButton = ``;
  let deleteButton = ``;
  let likeButton = `<a href="#" class="tweets-like" data-id="${tweet.id}">Like (${tweet.like_count || 0})</a>`;

  if (tweet.replies) {
    replyButton = `<a href="#" class="tweets-reply" data-id="${tweet.id}">Reply (${tweet.reply_count || 0})</a>`;
  }

  if (tweet.author === this.bp.me || this.bp.me === 'Marak') { // TODO: admin rbac check
    deleteButton = `<a href="#" class="tweets-delete" data-id="${tweet.id}">Delete</a>`;
  }

  if (options.noToolbar) {
    replyButton = ``;
    deleteButton = ``;
    likeButton = ``;
  }

  // open-app" data-app="tweets" data-type="post" data-context="${tweet.id}"
  let html = `
    <div class="tweets-post desktop-section" data-tweet="${tweet.id}">
      <div class="tweets-author">
        <a href="#" class="open-app" data-app="tweets" data-context="${tweet.author}">
          @${tweet.author}
        </a>
      </div>
      <div class="tweets-content">${tweet.content}</div>
      <div class="tweets-meta">${new Date(tweet.ctime).toLocaleString()}</div>
      <div class="tweets-toolbar">
        ${likeButton}
        ${replyButton}
        ${deleteButton}
      </div>
  `

  if (tweet.replies && tweet.replies.length > 0) {
    html += `<div class="tweets-replies">`
    tweet.replies.forEach(reply => {
      html += this.renderTweet(reply, options) // recursion for nested replies
    })
    html += `</div>`
  }

  html += `</div>`
  return html
}