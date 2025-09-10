import parseMarkdownWithoutPTags from '../../buddylist/lib/message/parseMarkdownWithoutPTags.js';


export default function renderTweet(tweet, tweetsWindow, options = {}) {
  let showReplyButton = true;
  let replyButton = ``;
  let deleteButton = ``;
  let likeButton = `<a href="#" class="tweets-like" data-id="${tweet.id}">Like (${tweet.like_count || 0})</a>`;

  // TODO: we need to check if the tweet.parent_id exists in the DOM, if so, we need to nest this tweet under that parent as a reply

  // Check if tweet already exists in DOM
  let existingTweet = $(`[data-tweet="${tweet.id}"]`, tweetsWindow.content);
  if (options.noRender !== true && existingTweet.length > 0) {
    // --- Differential update ---
    existingTweet.attr('data-likes', tweet.like_count || 0);
    existingTweet.attr('data-replies', tweet.reply_count || 0);

    $('.tweets-like', existingTweet).html(`Like (${tweet.like_count || 0})`);
    $('.tweets-reply', existingTweet).html(`Reply (${tweet.reply_count || 0})`);

    // update content in case it changed (edits)
    $('.tweets-content', existingTweet).text(tweet.content);
    $('.tweets-meta', existingTweet).html(new Date(tweet.ctime).toLocaleString());

    // --- Handle replies differential update ---
    if (options.noRender !== true && tweet.replies && tweet.replies.length > 0) {
      let repliesContainer = existingTweet.children('.tweets-replies');
      if (repliesContainer.length === 0) {
        repliesContainer = $('<div class="tweets-replies"></div>');
        existingTweet.append(repliesContainer);
      }

      // Render replies
      const seenReplies = new Set();
      tweet.replies.forEach(reply => {
        seenReplies.add(reply.id);
        const replyHtml = this.renderTweet(reply, tweetsWindow, options);
        if (replyHtml) {
          repliesContainer.append(replyHtml);
        }
      });

      // Remove replies that no longer exist
      repliesContainer.children('[data-tweet]').each((_, el) => {
        const replyId = $(el).attr('data-tweet');
        if (!seenReplies.has(replyId)) {
          $(el).remove();
        }
      });
    }

    return ''; // stop here, already updated DOM
  }

  // --- New Tweet ---
  if (!tweet.parent_id) {
    replyButton = `<a href="#" class="tweets-reply" data-id="${tweet.id}">Reply (${tweet.reply_count || 0})</a>`;
  }

  if (tweet.author === this.bp.me || this.bp.me === 'Marak') {
    deleteButton = `<a href="#" class="tweets-delete" data-id="${tweet.id}">Delete</a>`;
  }

  if (options.noToolbar) {
    replyButton = ``;
    deleteButton = ``;
    likeButton = ``;
  }

  let $tweet = $(`
  <div class="tweets-post desktop-section" data-tweet="${tweet.id}" data-likes="${tweet.like_count || 0}" data-replies="${tweet.reply_count || 0}">
    <div class="tweets-author">
      <a href="#" class="open-app" data-app="tweets" data-context="${tweet.author}">
        @${tweet.author}
      </a>
    </div>
    <div class="tweets-content"></div>
    <div class="tweets-meta"></div>
    <div class="tweets-toolbar">
      ${likeButton}
      ${replyButton}
      ${deleteButton}
    </div>
  </div>
`);

  // safely insert user content
  // this will render through the markdown parser + DOMPurify code path
  // TODO: add ability for "cards" same as chat messages
  tweet.content = parseMarkdownWithoutPTags(tweet.content);

  console.log('Rendering tweet:', tweet);

  $('.tweets-content', $tweet).html(tweet.content);
  $('.tweets-meta', $tweet).text(new Date(tweet.ctime).toLocaleString());

  // append replies if any
  if (options.noRender !== true && tweet.replies && tweet.replies.length > 0) {
    let $replies = $('<div class="tweets-replies"></div>');
    tweet.replies.forEach(reply => {
      $replies.append(this.renderTweet(reply, tweetsWindow, options));
    });
    $tweet.append($replies);
  }

  return $tweet;

}
