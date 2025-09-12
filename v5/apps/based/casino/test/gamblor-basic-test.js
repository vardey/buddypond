import tape from 'tape';
import Gamblor from '../GamblorClass.js';

tape('Gamblor can load and has expected methods and properties', (t) => {
    const gamblor = new Gamblor();

    t.equal(typeof Gamblor, 'function', 'Gamblor is a function');
    t.end();
});

tape('Gamblor handles coinflip bets correctly', (t) => {
    const gamblor = new Gamblor();
    const result = gamblor.bet({
        bets: [
            { buddy: 'buddy1', amount: 100, bet: 'heads', seed: 'seed1' },
            { buddy: 'buddy2', amount: 100, bet: 'tails', seed: 'seed2' },
            { buddy: 'buddy3', amount: 100, bet: 'heads', seed: 'seed3' }
        ],
        type: 'coinflip'
    });

    t.equal(result.bets.length, 3, 'Three bets processed');
    console.log(result);
    let winners = result.winners;
    console.log('Winners:', winners);
   
    t.ok(['heads', 'tails'].includes(result.result), 'Coinflip result is either heads or tails');
    t.ok(winners.length > 0, 'There are winners');
    t.ok(winners.every(w => ['heads', 'tails'].includes(w.bet)), 'All winners have valid bets');
    t.equal(result.amount, 300, 'Total amount is correct');
    t.end();
});

tape('Gamblor handles highroll bets correctly', (t) => {
    const gamblor = new Gamblor();
    const result = gamblor.bet({
        bets: [
            { buddy: 'buddy1', amount: 100, seed: 'seed1' },
            { buddy: 'buddy2', amount: 100, seed: 'seed2' },
            { buddy: 'buddy3', amount: 100, seed: 'seed3' }
        ],
        type: 'highroll'
    });

    let winners = result.winners;
    console.log('Highroll winners:', winners);
    t.equal(result.bets.length, 3, 'Three bets processed');
    t.ok(winners.length > 0, 'There are winners');
    t.ok(winners.every(w => typeof w.bet === 'number'), 'All winners have valid bets');
    t.equal(result.amount, 300, 'Total amount is correct');
    t.end();
});

tape('Gamblor aggregates seeds correctly', (t) => {
    const gamblor = new Gamblor();
    gamblor.bet({
        bets: [
            { buddy: 'buddy1', amount: 100, seed: 'seed1' },
            { buddy: 'buddy2', amount: 100 },
            { buddy: 'buddy3', amount: 100, seed: 'seed3' }
        ],
        type: 'highroll'
    });

    t.ok(gamblor.ramblor.userSeed.includes('seed1') && gamblor.ramblor.userSeed.includes('seed3'), 'Seeds are correctly aggregated');
    t.end();
});