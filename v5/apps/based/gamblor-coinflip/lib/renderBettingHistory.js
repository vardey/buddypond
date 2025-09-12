export default async function renderingBettingHistory(page = 1) {

  // get previous bets that this user has created
  let result = await this.client.apiRequest(`/bets?owner=${this.bp.me}&type=coinflip&page=${page}&limit=8`, 'GET');
  console.log('api response for previous bets:', result);
  let previousBets = result.results || [];
  let pagination = result.pagination || { page: 1, totalPages: 1 };
  console.log('Loaded previous bets:', previousBets);

  const previousBetsList = $('.coinflip-previous-bets-list', this.win.content).empty();

  // Add header row
  /*
  previousBetsList.append(`
    <li class="bet-header">
      <span class="col-outcome">Outcome</span>
      <span class="col-result">Result</span>
      <span class="col-amount">Amount</span>
      <span class="col-date">Date</span>
    </li>
  `);
  */

  if (previousBets.length === 0) {
    previousBetsList.append('<span class="no-bets">No previous bets found.</span>');
  } else {
    previousBets.forEach(bet => {
      const betLink = `https://${window.location.host}/app/coinflip?context=${bet.id}`;

      let resultJSON = {};
      if (bet.result) {
        try {
          resultJSON = JSON.parse(bet.result);
        } catch (e) {
          console.error('Error parsing bet result JSON:', e);
        }
      }

      let buddyWon = false;
      if (Array.isArray(resultJSON.winners) && resultJSON.winners.some(winner => winner.buddy === this.bp.me)) {
        buddyWon = true;
      }

      let outcomeText = resultJSON.result || "-";
      let resultText = "";
      if (bet.status === "complete") {
        if (buddyWon) {
          resultText = `<span style="color:#4CAF50;font-weight:bold;">You Won!</span>`;
        } else {
          resultText = `<span style="color:#F44336;font-weight:bold;">You Lost</span>`;
        }
      } else {
        resultText = `<span style="color:#999;">Pending</span>`;
      }

      let amountText = `${bet.amount} ${bet.symbol}`;
      let betDate = new Date(bet.ctime).toLocaleString();

      previousBetsList.append(`
        <li class="bet-row">
          <span class="col-outcome">${outcomeText}</span>
          <span class="col-result">${resultText}</span>
          <span class="col-amount">${amountText}</span>
          <span class="col-date"><a href="${betLink}" target="#" class="open-app" data-app="gamblor-coinflip" data-context="${bet.id}">${betDate}</a></span>
        </li>
      `);
    });

    console.log('pagination', pagination);
    $('.page-info').text(`Page ${pagination.page} of ${pagination.totalPages}`);
    $('.prev-page').prop('disabled', pagination.page <= 1);
    $('.next-page').prop('disabled', pagination.page >= pagination.totalPages);
    $('.pagination-controls').data('current-page', pagination.page);
  }
}
