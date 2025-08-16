/* Tweets.js - Marak Squires 2025 - BuddyPond */
import client from './lib/client.js';
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
    // await this.bp.appendScript('/v5/apps/based/tweets/vendor/source-map.bundle.js');
    return 'loaded tweets window';
  }

  async open(options = {}) {
    if (options.context === 'default') {
      options.context = this.bp.me;
    }
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

    // $(this.tweetsWindow.content).html(this.html);

    await this.render(options.context, renderType, this.tweetsWindow);
    this.eventBind(renderType, this.tweetsWindow);

    return this.tweetsWindow;
  }

}

//Tweets.prototype.render = render;
//Tweets.prototype.eventBind = eventBind;
Tweets.prototype.client = client;
Tweets.prototype.eventBind = eventBind;
Tweets.prototype.render = render;
Tweets.prototype.renderTweet = renderTweet;