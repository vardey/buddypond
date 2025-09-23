import api from './lib/api.js';
import fishingClient from './lib/fishingClient.js';

export default class Fishing {
  // constructor is required, it is called when the app is loaded
  constructor(bp, options = {}) {
    this.bp = bp;
    this.options = options;
    return this;
  }

  // init is required, it is called when the app is opened or initialized
  async init() {
    this.html = await this.bp.load('/v5/apps/based/fishing/fishing.html');
    await this.bp.load('/v5/apps/based/fishing/fishing.css');
    await this.bp.appendScript('https://cdn.jsdelivr.net/npm/chart.js');

    return 'loaded Fishing';
  }

  async open() {
    if (!this.win) {
      this.win = await this.bp.window(this.window());
      this.client = fishingClient;

      const fishData = api.Fish;

      console.log('Fish data loaded:', fishData);

      // Count fish by rarity
      const rarityCounts = fishData.reduce((acc, fish) => {
        acc[fish.rarity] = (acc[fish.rarity] || 0) + 1;
        return acc;
      }, {});

      console.log('Fish counts by rarity:', rarityCounts);
      new Chart(document.getElementById('fishing-chart-fish-rarity'), {
        type: 'doughnut',
        data: {
          labels: Object.keys(rarityCounts),
          datasets: [{
            data: Object.values(rarityCounts),
            backgroundColor: ['#4caf50', '#2196f3', '#9c27b0', '#ff9800']
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Fish Distribution by Rarity'
            }
          }
        }
      });

      $('.fishing-cast', this.win.content).on('click', async (e) => {
        //TODO: POST not GET...
        this.client.apiRequest('/cast', 'GET').then(result => {
          console.log('Fishing cast result:', result);
          let resultsDiv = $('.fishing-results', this.win.content);
          let resultHtml = `<p>You caught a <strong>${result.name}</strong> (Rarity: ${result.rarity})</p>`;
          if (result.mutation) {
            resultHtml += `<p>Mutation occurred! You also caught a <strong>${result.mutation.name}</strong> (Rarity: ${result.mutation.rarity})</p>`;
          }
          resultsDiv.prepend(resultHtml);
        }).catch(err => {
          console.error('Fishing cast error:', err);
        });
      });

      console.log('Fishing window opened', api);

    }
    return this.win;
  }

  window() {

    return {
      id: 'fishing',
      title: 'Fishing',
      icon: 'desktop/assets/images/icons/icon_buddy-frog_64.webp',
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
