import gamblorClient from '../gamblor/lib/client.js';
import eventBind from './lib/eventBind.js';
import renderBettingHistory from './lib/renderBettingHistory.js';
import renderBet from './lib/renderBet.js';
import updateBalance from './lib/updateBalance.js';

export default class GamblorCoinFlip {
  constructor(bp, options = {}) {
    this.bp = bp;
    this.options = options;
    return this;
  }

  async init() {
    this.html = await this.bp.load('/v5/apps/based/gamblor-coinflip/gamblor-coinflip.html');
    await this.bp.load('/v5/apps/based/gamblor-coinflip/gamblor-coinflip.css');

    return 'loaded GamblorCoinFlip';
  }

  async open(config = {}) {
    console.log('Opening GamblorCoinFlip Buddy with config:', config);

    if (!this.win) {
      this.win = await this.bp.window(this.window());
      // this should be handled globally ( if possible )
      $('.loggedIn', this.win.content).hide();
      $('.loggedOut', this.win.content).show();
      this.eventBind(config);
    }

    this.renderBettingHistory();
    if (config.context && config.context !== 'default') {
      let bet = await this.client.apiRequest(`/bet/${config.context}`, 'GET');
      console.log('Loaded bet for context:', bet);
      if (bet) {
        this.renderBet(bet);
      }
    } else {
      $('.coinflip-form', this.win.content).show();
      $('.coinflip-loaded-bet', this.win.content).hide();
    }

    $('.coinflip-max-participants', this.win.content).hide();
    this.updateBalance();

    return this.win;

  }

  window() {
    return {
      id: 'gamblor-coinflip',
      title: 'Coin Flip',
      icon: 'desktop/assets/images/icons/icon_buddy-frog_64.png',
      position: 'center',
      parent: $('#desktop')[0],
      width: 850,
      height: 600,
      content: this.html,
      resizable: true,
      closable: true,
      onClose: () => {
        this.win = null;
      }
    }
  }
}

GamblorCoinFlip.prototype.updateBalance = updateBalance;
GamblorCoinFlip.prototype.client = gamblorClient;
GamblorCoinFlip.prototype.eventBind = eventBind;
GamblorCoinFlip.prototype.renderBet = renderBet;
GamblorCoinFlip.prototype.renderBettingHistory = renderBettingHistory;