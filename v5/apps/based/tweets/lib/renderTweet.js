import parseMarkdownWithoutPTags from '../../buddylist/lib/message/parseMarkdownWithoutPTags.js';
import checkForLinksInMessage from '../../buddylist/lib/message/checkForLinksInMessage.js';

export default async function renderTweet(tweet, tweetsWindow, options = {}) {
  let showReplyButton = true;
  let replyButton = ``;
  let deleteButton = ``;
  let likeButton = `<a href="#" class="tweets-like" data-id="${tweet.id}">Like (${tweet.like_count || 0})</a>`;

  // Check if tweet already exists in DOM
  let existingTweet = $(`[data-tweet="${tweet.id}"]`, tweetsWindow.content);
  if (options.noRender !== true && existingTweet.length > 0) {
    // --- Differential update ---
    existingTweet.attr('data-likes', tweet.like_count || 0);
    existingTweet.attr('data-replies', tweet.reply_count || 0);

    $('.tweets-like', existingTweet).html(`Like (${tweet.like_count || 0})`);
    $('.tweets-reply', existingTweet).html(`Reply (${tweet.reply_count || 0})`);

    console.log('Updating existing tweet:', tweet);

    // Normalize text and run link detection (keep same parsing pipeline as new render)
    tweet.text = tweet.content || '';
    checkForLinksInMessage(tweet);
    tweet.text = parseMarkdownWithoutPTags(tweet.text);

    // update content in case it changed (edits)
    if (!tweet.card) {
      $('.tweets-content', existingTweet).html(tweet.text);
    }

    $('.tweets-meta', existingTweet).html(new Date(tweet.ctime).toLocaleString());

    // --- Handle card rendering for updates ---
    try {
      // Remove any previous card containers so we replace them
      existingTweet.find('.cardContainer').remove();

      const cardContainer = await renderCardForTweet(tweet, existingTweet, this.bp);
      if (cardContainer) {
        $('.tweets-content', existingTweet).append(cardContainer);
      }
    } catch (err) {
      // Already logged inside helper; keep UI stable
      console.error('Failed to update card for tweet', tweet && tweet.id, err);
    }

    // --- Handle replies differential update ---
    if (options.noRender !== true && tweet.replies && tweet.replies.length > 0) {
      let repliesContainer = existingTweet.children('.tweets-replies');
      if (repliesContainer.length === 0) {
        repliesContainer = $('<div class="tweets-replies"></div>');
        existingTweet.append(repliesContainer);
      }

      // Render replies (differentially)
      const seenReplies = new Set();
      tweet.replies.forEach(async reply => {
        seenReplies.add(reply.id);
        const replyHtml = await this.renderTweet(reply, tweetsWindow, options);
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
  tweet.text = tweet.content || '';
  checkForLinksInMessage(tweet);
  tweet.text = parseMarkdownWithoutPTags(tweet.text);

  let container = null;
  if (tweet.card && this.bp && this.bp.apps && this.bp.apps.card) {
    console.log('tweet has card', tweet.card);
    try {
      container = await renderCardForTweet(tweet, $tweet, this.bp);
      console.log('Rendering card into container', container);
    } catch (err) {
      console.error('Error while rendering card for new tweet', tweet && tweet.id, err);
      container = null;
    }
  }

  // console.log('Rendering tweet:', tweet);
  // console.log('With card container:', container);

  // update content in case it changed (edits)
  if (!tweet.card) {
    $('.tweets-content', $tweet).html(tweet.text);
  }

  if (container) {
    $('.tweets-content', $tweet).append(container);
  }
  $('.tweets-meta', $tweet).text(new Date(tweet.ctime).toLocaleString());

  // append replies if any
  if (options.noRender !== true && tweet.replies && tweet.replies.length > 0) {
    let $replies = $('<div class="tweets-replies"></div>');
    tweet.replies.forEach(async reply => {
      $replies.append(await this.renderTweet(reply, tweetsWindow, options));
    });
    $tweet.append($replies);
  }

  return $tweet;
}


async function renderCardForTweet(tweet, $tweet, bp) {
  // Returns a DOM element (container) for the card, or null on no-card / error.
  if (!tweet || !tweet.card || !bp || !bp.apps || !bp.apps.card) {
    return null;
  }

  const cardData = tweet.card || {};
  if (Object.keys(cardData).length === 0) {
    return null;
  }

  try {
    // Give the card context the tweet message
    cardData.message = tweet;
    console.log('cccccc cardData', cardData);
    const cardManager = bp.apps.card.cardManager;
    // provide current $tweet HTML as the context (mirrors original behavior)
    const _card = await cardManager.loadCard(cardData.type, cardData, $tweet.html());

    const container = document.createElement('div');
    container.classList.add('cardContainer');

    // Render card into container (await if returns promise)
    await _card.render(container);

    return container;
  } catch (err) {
    console.error('Error rendering card for tweet', tweet && tweet.id, err);
    return null;
  }
}
