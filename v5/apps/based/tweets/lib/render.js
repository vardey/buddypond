export default async function render(context, type = 'author', tweetsWindow) {

  $(tweetsWindow.content).html(this.html);

  if (this.bp.me === 'Guest' || !this.bp.me) {
    $('.loggedIn', this.tweetsWindow.content).hide();
    $('.loggedOut', this.tweetsWindow.content).show();
  } else {
    $('.loggedIn', this.tweetsWindow.content).show();
    $('.loggedOut', this.tweetsWindow.content).hide();
  }

  /*
  if (context !== this.bp.me && context !== 'all') {
    $('.tweets-composer', tweetsWindow.content).hide();
  } else {
    $('.tweets-composer', tweetsWindow.content).show();
  }
    */

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
  // tweetList.empty();
  tweets.forEach(tweet => {

    // first check if tweet already exists in the DOM with data-tweet attribute

    tweetList.append(this.renderTweet(tweet))
  })

}
