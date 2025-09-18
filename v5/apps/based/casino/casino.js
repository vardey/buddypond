import client from './lib/client.js';

export default class Gamblor {
    constructor(bp, options = {}) {
        this.bp = bp;
        return this;
    }

    async init() {
        this.bp.log('Hello from Gamblor');

        this.client = client;

        // we can load modules or html fragments or css files here
        // using this.bp.load() method

        // injects CSS link tag into the head of document
        await this.bp.load('/v5/apps/based/casino/casino.css');

        // fetches html from the fragment and returns it as a string
        this.html = await this.bp.load('/v5/apps/based/casino/casino.html');

        return this;
    }

    async open () {


        this.gamblorWindow = this.bp.apps.ui.windowManager.createWindow({
            id: 'casino',
            title: 'Casino',
            x: 50,
            y: 100,
            width: 800,
            height: 500,
            minWidth: 200,
            minHeight: 200,
            icon: 'desktop/assets/images/icons/icon_casino_64.webp',
            parent: $('#desktop')[0],
            content: this.html,
            resizable: true,
            minimizable: true,
            maximizable: true,
            closable: true,
            focusable: true,
            maximized: false,
            minimized: false
        });
        /*
        let result = await this.client.apiRequest('/bets', 'GET');
        let bets = result.results || [];
        // populate the gamblor-bets-table
        console.log('bets result', bets);

        $('.gamblor-bets-table body', this.gamblorWindow.content).empty();
        bets.forEach(bet => {
          console.log('bet', bet);
            let row = `<tr>
                <td>${bet.id}</td>
                <td>${bet.owner}</td>
                <td>${bet.type}</td>
                <td>${bet.symbol}</td>
                <td>${bet.amount}</td>
                <td>${bet.status}</td>
                <td>${bet.max_participants}</td>
                <td>${bet.participants_count}</td>
                <td>${bet.ctime} ${new Date(bet.ctime).toLocaleString()}</td>
            </tr>`;
            $('.gamblor-bets-table tbody', this.gamblorWindow.content).append(row);
        });
        */
        
        return this.gamblorWindow;


    }
}