import gamblorClient from './lib/gamblorClient.js';

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

    this.win = await this.bp.window(this.window());
    // this should be handled globally ( if possible )
    $('.loggedIn', this.win.content).hide();
    $('.loggedOut', this.win.content).show();

    if (config.context && config.context !== 'default') {
      let bet = await this.client.apiRequest(`/bet/${config.context}`, 'GET');
      console.log('Loaded bet for context:', bet);

      if (bet) {
        $('.coinflip-form', this.win.content).hide();
        $('.coinflip-loaded-bet', this.win.content).show();

        $('.coinflip-status', this.win.content).text(bet.bet.status);
        $('.coinflip-owner', this.win.content).text(bet.bet.owner);
        $('.coinflip-amount-display', this.win.content).text(`${bet.bet.amount} ${bet.bet.symbol}`);
        $('.coinflip-max-display', this.win.content).text(bet.bet.max_participants || '2');

        const list = $('.coinflip-participants-list', this.win.content).empty();
        bet.participants.forEach(p => {
          list.append(`<li>${p.buddy} - ${p.bet}</li>`);
        });

        if (bet.bet.status === 'open') {
          $('.coinflip-join-button', this.win.content).show();
          $('.coinflip-cancel-button', this.win.content).show();
        } else {
          $('.coinflip-join-button', this.win.content).hide();
          $('.coinflip-cancel-button', this.win.content).hide();
        }

        // bind button actions
        $('.coinflip-join-button', this.win.content).off('click').on('click', async () => {
          let betSide = prompt('Choose your side (heads/tails):');
          if (betSide !== 'heads' && betSide !== 'tails') {
            alert('Invalid side selected.');
            return;
          }

          let response = await this.client.apiRequest(`/join-bet/${bet.bet.id}`, 'POST', {
            betId: bet.bet.id,
            buddy: this.bp.me,
            amount: bet.bet.amount,
            seed: 'random-join-seed-' + Date.now(),
            bet: betSide
          });

          alert(response.success ? 'Joined bet!' : 'Failed to join.');
          this.win.close(); // Refresh UI
        });

        $('.coinflip-cancel-button', this.win.content).off('click').on('click', async () => {
          let confirmCancel = confirm('Are you sure you want to cancel this bet?');
          if (!confirmCancel) return;

          let response = await this.client.apiRequest(`/cancel-bet/${bet.bet.id}`, 'POST');
          alert(response.success ? 'Bet cancelled.' : 'Failed to cancel.');
          this.win.close(); // Refresh UI
        });
      }
    }


    $('.coinflip-form', this.win.content).on('submit', async (e) => {
      e.preventDefault();
      const betAmount = parseFloat($('#coinflip-amount', this.win.content).val());
      const betSide = $('#coinflip-bet', this.win.content).val();
      const max_participants = parseInt($('#coinflip-max-participants', this.win.content).val(), 10) || 2; // Default to 2 participants
      // const betCurrency = $('.coinflip-bet-currency', this.win.content).val();
      let betCurrency = 'GBP';    // Default currency, can be changed later
      console.log('betAmount', betAmount, 'betSide', betSide, 'betCurrency', betCurrency);
      if (isNaN(betAmount) || betAmount <= 0) {
        alert('Please enter a valid bet amount.');
        return;
      }

      if (!betSide) {
        alert('Please select a side to bet on.');
        return;
      }

      let bet = await this.client.apiRequest('/bet', 'POST', {
        type: 'coinflip',
        owner: this.bp.me,
        bet: betSide,
        symbol: betCurrency,
        amount: betAmount,
        max_participants: max_participants || 2, // Default to 2 participants
        seed: 'seed-sally-123' // TODO: custom seed generation from input
      });

      console.log('creted bet', bet)


      $('.coinflip-result-data', this.win.content).text(JSON.stringify(bet, null, 2));
      $('.coinflip-result', this.win.content).show();
      $('.coinflip-link', this.win.content).attr('href', `https://${window.location.host}/app/coinflip?context=${bet.betId}`);

    });

  }

  window() {
    return {
      id: 'gamblor-coinflip',
      title: 'GamblorCoinFlip Buddy',
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

GamblorCoinFlip.prototype.client = gamblorClient;