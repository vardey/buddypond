export default async function renderingBettingHistory (page = 1) {

    // get previous bets that this user has created
    let result = await this.client.apiRequest(`/bets?owner=${this.bp.me}&type=coinflip&page=${page}`, 'GET');
    console.log('api response for previous bets:', result);
    let previousBets = result.results || [];
    let pagination = result.pagination || { page: 1, totalPages: 1 };
    console.log('Loaded previous bets:', previousBets);
    const previousBetsList = $('.coinflip-previous-bets-list', this.win.content).empty();
    if (previousBets.length === 0) {
      previousBetsList.append('<li>No previous bets found.</li>');
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

        console.log('bet with resultJSON', resultJSON);
        let buddyWon = false;
        // check if resultJSON.winners is an array of objects and contains a winner with 'buddy' equal to this.bp.me
        if (Array.isArray(resultJSON.winners) && resultJSON.winners.some(winner => winner.buddy === this.bp.me)) {
          console.log('User is a winner in this bet:', this.bp.me);
          buddyWon = true;
        }

        let winningText = '';
        if (bet.status === 'complete') {
          if (buddyWon) {
            winningText = '<span style="color: #4CAF50; font-weight: bold;">(You Won!)</span>';
          } else {
            winningText = '<span style="color: #F44336; font-weight: bold;">(You Lost)</span>';
          }
        }
        let betDate = new Date(bet.ctime).toLocaleString();
        //  Bet ID: ${bet.id}</a> - - Status: ${bet.status}
        previousBetsList.append(`
          <li>
            ${winningText} <a href="${betLink}" target="#" class="open-app" data-app="gamblor-coinflip" data-context="${bet.id}"> - ${bet.amount} ${bet.symbol} - ${betDate}</a>
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