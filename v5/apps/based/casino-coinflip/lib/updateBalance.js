export default async function updateBalance () {

  let coinBalance = $('.coin-balance', this.win.content);
  let currentCoin = 'GBP'; // default currency for bets

  await this.bp.load('portfolio'); // will get cached / be cached

  // get the portfolio's assets
  const assets = await this.bp.apps.portfolio.resource.search(this.bp.me, {
    owner: this.bp.me
  });
  console.log('assetsassetsassets', currentCoin, assets.results);
  let coinBalances = assets.results;
  // update the $('.coin-names') select element
  // first clear all options
  coinBalances.forEach(asset => {
    console.log(`asset.symbol: ${asset.symbol} === currentCoin: ${currentCoin}`, asset);
    $('#coin-send-name', this.win.content).append(`<option value="${asset.symbol}">${asset.symbol}</option>`);
    if (asset.symbol === currentCoin) {
      let formattedAsset = asset.amount;
      // format amount as number with commas
      formattedAsset = formattedAsset.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
      });

      coinBalance.text(formattedAsset + ' ' + asset.symbol);
      this.bp.emit('buddylist-websocket::reward', {
        success: true,
        message: {
          newBalance: asset.amount,
          symbol: asset.symbol
        }
      })

    }
  });

}