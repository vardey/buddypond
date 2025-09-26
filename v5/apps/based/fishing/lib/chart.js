  //     await this.bp.appendScript('https://cdn.jsdelivr.net/npm/chart.js');

  showChart(fishData) {

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

  }
