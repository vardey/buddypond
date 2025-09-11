export default function renderBet(bet) {

  $('.coinflip-form', this.win.content).hide();
  $('.coinflip-loaded-bet', this.win.content).show();

  $('.coinflip-status', this.win.content).text(bet.bet.status);
  $('.coinflip-owner', this.win.content).text(bet.bet.owner);
  $('.coinflip-amount-display', this.win.content).text(`${bet.bet.amount} ${bet.bet.symbol}`);
  $('.coinflip-max-display', this.win.content).text(bet.bet.max_participants || '2');
  // coinflip-result-date
  let betDate = new Date(bet.bet.ctime).toLocaleString();
  $('.coinflip-created-at', this.win.content).text(`${betDate}`);
  // coinflip-your-side
  let userParticipant = bet.participants.find(p => p.buddy === this.bp.me);
  if (userParticipant) {
    $('.coinflip-your-side', this.win.content).text(`${userParticipant.bet}`);
  } else {
    $('.coinflip-your-side', this.win.content).text(`You are not a participant in this bet.`);
  }
  // coinflip-winning-side
  console.log('bbbbbb', bet.bet.result)
  let betJSON = {};
  if (bet.bet.result) {
    try {
      betJSON = JSON.parse(bet.bet.result);
    } catch (e) {
      console.error('Error parsing bet result JSON:', e);
    }
  }
  console.log('betJSON', betJSON);
  if (bet.bet.status === 'complete') {
    $('.coinflip-winning-side', this.win.content).text(`${betJSON.result}`);
    $('.coinflip-result-date', this.win.content).text(`Resolved at: ${new Date(betJSON.result.resolved_at).toLocaleString()}`);
    if (bet.result.winners && Array.isArray(bet.result.winners)) {
      let winner = bet.result.winners.find(w => w.buddy === this.bp.me);
      if (winner) {
        $('.coinflip-won-amount', this.win.content).text(`You won ${winner.amount_won} ${bet.bet.symbol}!`);
      }
    }
  } else {
    $('.coinflip-winning-side', this.win.content).text(`Winning side: N/A`);
    $('.coinflip-result-date', this.win.content).text(`Resolved at: N/A`);
    $('.coinflip-won-amount', this.win.content).text(`You have not won anything yet.`);
  }
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