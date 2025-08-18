/* Tweets.js - Marak Squires 2025 - BuddyPond */
import client from './lib/client.js';
import wsClient from './lib/wsclient.js';
import eventBind from './lib/eventBind.js';
import render from './lib/render.js';
import renderTweet from './lib/renderTweet.js';

export default class Tweets {
  constructor(bp, options = {}) {
    this.bp = bp;
    this.icon = 'desktop/assets/images/icons/icon_tweets_64.png';
    return this;
  }

  async init() {
    this.html = await this.bp.load('/v5/apps/based/tweets/tweets.html');
    await this.bp.load('/v5/apps/based/tweets/tweets.css');
    return 'loaded tweets app';
  }

  async open(options = {}) {

    if (!this.tweetsWindow) {
      this.tweetsWindow = this.bp.apps.ui.windowManager.createWindow({
        id: 'tweets',
        title: 'Tweets',
        icon: this.icon,
        x: 250,
        y: 75,
        width: 800,
        height: 400,
        minWidth: 200,
        minHeight: 200,
        parent: $('#desktop')[0],
        content: '',
        resizable: true,
        minimizable: true,
        maximizable: true,
        closable: true,
        focusable: true,
        maximized: false,
        minimized: false,
        onClose: () => {
          this.tweetsWindow = null
          // remove tweets-reply-modal if exists
          $('.tweets-reply-modal').remove();
        }
      });
      this.tweetsWindow.loggedIn = true;
    }

    if (options.context === 'default' || !options.context || options.context === 'undefined') {
      options.context = 'all';
    }

    let renderType = 'author';
    if (options.type === 'post') {
      renderType = 'post';
    }

    this.tweetsWindow.context = options.context || 'all';


    if (!this.wsClient) {

      this.wsClient = new wsClient({ bp: this.bp });
      this.bp.on('tweets::connected', 'fetch-tweets-feed', (data) => {
        console.log('Tweets WebSocket connected event received in Tweets app', data);
        console.log('Tweets WebSocket connected');
        this.wsClient.fetchTweets(this.tweetsWindow.context);
      });

      this.bp.on('tweets::feed', 'render-tweets-feed', (tweets) => {
        console.log('Tweets feed event received in Tweets app', tweets);
        if (this.tweetsWindow) {
          this.render(tweets, this.tweetsWindow.context, 'author', this.tweetsWindow);
        }
      });

      this.bp.on('tweets::removed', 'remove-tweet', (tweetId) => {
        console.log('Tweet removed event received in Tweets app', tweetId);
        if (this.tweetsWindow) {
          // find the tweet by tweetId and remove
          $(`[data-tweet="${tweetId}"]`, this.tweetsWindow.content).remove();
          console.log('remove the tweet', tweetId);
        }
      });

      this.bp.on('tweets::error', 'tweets-error', (error) => {
        console.error('Tweets error event received in Tweets app', error);
        if (this.tweetsWindow) {
          const errorDiv = $('.tweets-error', this.tweetsWindow.content);
          if (errorDiv) {
            errorDiv.html(`<div class="error">Error: ${error.error}</div>`);
            setTimeout(() => {
              errorDiv.html('');
            }, 5000);
          }
        }
      });

      console.log('Connecting to Tweets WebSocket...');
      await this.wsClient.connect();

    } else {
      // fetch tweets feed for current context
      this.wsClient.fetchTweets(this.tweetsWindow.context);
    }


    $(this.tweetsWindow.content).html(this.html);

    this.eventBind(options.context, renderType, this.tweetsWindow);

    return this.tweetsWindow;
  }

}

Tweets.prototype.client = client;
Tweets.prototype.eventBind = eventBind;
Tweets.prototype.render = render;
Tweets.prototype.renderTweet = renderTweet;