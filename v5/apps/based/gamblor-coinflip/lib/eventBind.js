export default function eventBind(config) {

  // Toggle max participants input based on checkbox
  $('#coinflip-group-bet', this.win.content).on('change', (ev) => {
    if ($(ev.target).is(':checked')) {
      $('.coinflip-max-participants', this.win.content).show();
    } else {
      $('.coinflip-max-participants', this.win.content).hide();
    }
  });

  $('.coinflip-form', this.win.content).on('submit', async (e) => {
    e.preventDefault();

    const $clickedButton = $(e.originalEvent.submitter); // The button clicked
    const betSide = $clickedButton.data('side'); // "heads" or "tails"

    const betAmount = parseFloat($('#coinflip-amount', this.win.content).val());
    const isGroupBet = $('#coinflip-group-bet', this.win.content).is(':checked');
    const max_participants = isGroupBet
      ? parseInt($('#coinflip-max-participants', this.win.content).val(), 10) || 2
      : 1;

    let betCurrency = 'GBP'; // Default currency
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
      max_participants: max_participants,
      seed: 'seed-sally-123'
    });

    console.log('created bet', bet);

    $('.coinflip-result-data', this.win.content).text(JSON.stringify(bet, null, 2));
    $('.coinflip-result', this.win.content).show();
    $('.coinflip-link', this.win.content).attr(
      'href',
      `https://${window.location.host}/app/coinflip?context=${bet.betId}`
    );

    this.updateBalance();
    this.renderBettingHistory();
  });


  $('.prev-page', this.win.content).on('click', () => {
    const currentPage = $('.pagination-controls').data('current-page');
    if (currentPage > 1) this.renderBettingHistory(currentPage - 1);
  });

  $('.next-page', this.win.content).on('click', () => {
    const currentPage = $('.pagination-controls').data('current-page');
    this.renderBettingHistory(currentPage + 1);
  });


}