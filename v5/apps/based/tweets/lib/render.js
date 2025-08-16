export default async function render(context, type = 'author', tweetsWindow) {

  $(tweetsWindow.content).html(this.html);

  if (context !== this.bp.me && context !== 'all') {
    $('.tweets-composer', tweetsWindow.content).hide();
  } else {
    $('.tweets-composer', tweetsWindow.content).show();
  }

  let tweets;

  if (type === 'post' && context) {
    // fetch single tweet with replies from the backend
    tweets = await this.client.apiRequest(`/posts/${context}`);
    tweets = [tweets]; // wrap in array for uniform processing
  } else {
    // fetch tweets from the backend
    if (context !== this.bp.me && context !== 'all') {
      tweets = await this.client.apiRequest(`/feed/${context}`);
    } else {
      tweets = await this.client.apiRequest('/feed');
    }

  }

  console.log('Fetched tweets:', tweets);

  const tweetList = $('.tweets-timeline', tweetsWindow.content);
  tweetList.empty();
    tweets.forEach(tweet => {
    tweetList.append(this.renderTweet(tweet))
  })

}
