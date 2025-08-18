export default async function render(tweets, context, type = 'author', tweetsWindow) {
  if (this.bp.me === 'Guest' || !this.bp.me) {
    $('.loggedIn', this.tweetsWindow.content).hide();
    $('.loggedOut', this.tweetsWindow.content).show();
  } else {
    $('.loggedIn', this.tweetsWindow.content).show();
    $('.loggedOut', this.tweetsWindow.content).hide();
  }
  /*
  let tweets;

  if (type === 'post' && context) {
    // fetch single tweet with replies from the backend
    tweets = await this.client.apiRequest(`/posts/${context}`);
    tweets = [tweets]; // wrap in array for uniform processing
  } else {
    // fetch tweets from the backend
    if (context !== 'all') {
      // clear all tweets
      // $('.tweets-timeline', tweetsWindow.content).empty();
      tweets = await this.client.apiRequest(`/feed/${context}`);
    } else {
      tweets = await this.client.apiRequest('/feed');
    }

  }
  */

  // console.log('Fetched tweets:', tweets);

  const tweetList = $('.tweets-timeline', tweetsWindow.content);
  // tweetList.empty();
  tweets.forEach(tweet => {
    tweetList.prepend(this.renderTweet(tweet, tweetsWindow))
  })

}
