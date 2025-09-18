import gamblorClient from '../casino/lib/client.js';
import eventBind from './lib/eventBind.js';
import renderBettingHistory from './lib/renderBettingHistory.js';
import renderBet from './lib/renderBet.js';
import updateBalance from './lib/updateBalance.js';

export default class CasinoCoinFlip {
  constructor(bp, options = {}) {
    this.bp = bp;
    this.options = options;
    return this;
  }

  async init() {
    this.html = await this.bp.load('/v5/apps/based/casino-coinflip/casino-coinflip.html');
    await this.bp.load('/v5/apps/based/casino-coinflip/casino-coinflip.css');

    return 'loaded casino-coinflip';
  }

  async open(config = {}) {
    // console.log('Opening casino coinflip Buddy with config:', config);

    if (!this.win) {
      this.win = await this.bp.window(this.window());
      // this should be handled globally ( if possible )
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

    if (this.bp.qtokenid) {
      $('.loggedIn', this.win.content).show();
      $('.loggedOut', this.win.content).hide();
    } else {
      $('.loggedIn', this.win.content).hide();
      $('.loggedOut', this.win.content).show();
    }

    return this.win;

  }

  window() {
    return {
      id: 'casino-coinflip',
      title: 'Coin Flip',
      icon: 'desktop/assets/images/icons/icon_coinflip_64.webp',
      position: 'center',
      parent: $('#desktop')[0],
      width: 850,
      height: 520,
      content: this.html,
      resizable: true,
      closable: true,
      onClose: () => {
        this.win = null;
      }
    }
  }
}

CasinoCoinFlip.prototype.updateBalance = updateBalance;
CasinoCoinFlip.prototype.client = gamblorClient;
CasinoCoinFlip.prototype.eventBind = eventBind;
CasinoCoinFlip.prototype.renderBet = renderBet;
CasinoCoinFlip.prototype.renderBettingHistory = renderBettingHistory;