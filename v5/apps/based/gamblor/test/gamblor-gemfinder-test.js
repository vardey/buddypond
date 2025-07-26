import tape from 'tape';
import Gamblor from '../GamblorClass.js';

tape('Gamblor can load and has expected methods and properties', (t) => {
    const gamblor = new Gamblor();

    t.equal(typeof Gamblor, 'function', 'Gamblor is a function');
    t.end();
});

tape('Gamblor handles gemfinder bets correctly', (t) => {
    const gamblor = new Gamblor();
    const gameConfig = {
        grid_size: '5x5',
        gems: [
            { count: 5, multiplier: 1 },
            { count: 3, multiplier: 2 },
            { count: 1, multiplier: 3 },
            { count: 1, multiplier: 5 },
        ],
        empty_squares: 15,
        time_limit: 24 * 60 * 60 * 1000,
    };

    const result = gamblor.bet({
        bets: [
            { buddy: 'buddy1', amount: 50, seed: 'seed-gemfinder-1', discord_id: '12345', game_config: gameConfig },
        ],
        type: 'gemfinder',
    });

    t.equal(result.bets.length, 1, 'One bet processed');
    t.equal(result.bets[0].buddy, 'buddy1', 'Bet buddy is correct');
    t.equal(result.bets[0].amount, 50, 'Bet amount is correct');
    t.deepEqual(result.bets[0].clicks, [], 'Bet has empty clicks array initially');
    t.equal(result.winners.length, 0, 'No winners initially');
    t.equal(result.amount, 50, 'Total amount is correct');
    t.ok(result.ramblorResult, 'Ramblor result is included');
    t.ok(result.result.grid, 'Result includes grid');
    t.equal(result.result.grid_size, '5x5', 'Grid size is correct');
    t.equal(result.result.grid.length, 10, 'Grid contains 10 gems');
    t.ok(
        result.result.grid.every(g => g.x >= 0 && g.x < 5 && g.y >= 0 && g.y < 5 && g.buddy === null),
        'All gems have valid coordinates and no assigned buddy'
    );
    t.equal(
        result.result.grid.filter(g => g.multiplier === 1).length,
        5,
        'Grid has 5 gems with 1x multiplier'
    );
    t.equal(
        result.result.grid.filter(g => g.multiplier === 2).length,
        3,
        'Grid has 3 gems with 2x multiplier'
    );
    t.equal(
        result.result.grid.filter(g => g.multiplier === 3).length,
        1,
        'Grid has 1 gem with 3x multiplier'
    );
    t.equal(
        result.result.grid.filter(g => g.multiplier === 5).length,
        1,
        'Grid has 1 gem with 5x multiplier'
    );
    t.end();
});

/*
tape('Gamblor gemfinder handles seeding correctly', (t) => {
    const gamblor1 = new Gamblor();
    const gamblor2 = new Gamblor();
    const gameConfig = {
        grid_size: '5x5',
        gems: [
            { count: 5, multiplier: 1 },
            { count: 3, multiplier: 2 },
            { count: 1, multiplier: 3 },
            { count: 1, multiplier: 5 },
        ],
    };

    const seed = 'seed-gemfinder-test';
    const result1 = gamblor1.bet({
        bets: [{ buddy: 'buddy1', amount: 50, seed, game_config: gameConfig }],
        type: 'gemfinder',
    });
    const result2 = gamblor2.bet({
        bets: [{ buddy: 'buddy1', amount: 50, seed, game_config: gameConfig }],
        type: 'gemfinder',
    });

    t.deepEqual(
        result1.result.grid,
        result2.result.grid,
        'Grids are identical with the same seed'
    );
    t.ok(gamblor1.ramblor.userSeed.includes(seed), 'Seed is correctly aggregated');
    t.end();
});
*/

/*
tape('Gamblor gemfinder throws error for invalid grid size', (t) => {
    const gamblor = new Gamblor();
    const gameConfig = {
        grid_size: '2x2', // Too small for 10 gems
        gems: [
            { count: 5, multiplier: 1 },
            { count: 3, multiplier: 2 },
            { count: 1, multiplier: 3 },
            { count: 1, multiplier: 5 },
        ],
    };

    t.throws(
        () =>
            gamblor.bet({
                bets: [{ buddy: 'buddy1', amount: 50, game_config: gameConfig }],
                type: 'gemfinder',
            }),
        /Grid too small for number of gems/,
        'Throws error for grid too small'
    );
    t.end();
});

tape('Gamblor gemfinder handles multiple bets correctly', (t) => {
    const gamblor = new Gamblor();
    const gameConfig = {
        grid_size: '5x5',
        gems: [
            { count: 5, multiplier: 1 },
            { count: 3, multiplier: 2 },
            { count: 1, multiplier: 3 },
            { count: 1, multiplier: 5 },
        ],
    };

    const result = gamblor.bet({
        bets: [
            { buddy: 'buddy1', amount: 50, seed: 'seed1', game_config: gameConfig },
            { buddy: 'buddy2', amount: 50, seed: 'seed2', game_config: gameConfig },
        ],
        type: 'gemfinder',
    });

    console.log('Gamblor gemfinder multiple bets result:', result);
    t.equal(result.bets.length, 2, 'Two bets processed');
    t.equal(result.bets[0].buddy, 'buddy1', 'First bet buddy is correct');
    t.equal(result.bets[1].buddy, 'buddy2', 'Second bet buddy is correct');
    t.deepEqual(result.bets[0].clicks, [], 'First bet has empty clicks array');
    t.deepEqual(result.bets[1].clicks, [], 'Second bet has empty clicks array');
    t.equal(result.amount, 100, 'Total amount is correct');
    t.equal(result.result.grid.length, 10, 'Grid contains 10 gems');
    t.ok(
        gamblor.ramblor.userSeed.includes('seed1') && gamblor.ramblor.userSeed.includes('seed2'),
        'Both seeds are aggregated'
    );
    t.end();
});

tape('Gamblor gemfinder ensures unique gem placements', (t) => {
    const gamblor = new Gamblor();
    const gameConfig = {
        grid_size: '5x5',
        gems: [
            { count: 5, multiplier: 1 },
            { count: 3, multiplier: 2 },
            { count: 1, multiplier: 3 },
            { count: 1, multiplier: 5 },
        ],
    };

    const result = gamblor.bet({
        bets: [{ buddy: 'buddy1', amount: 50, game_config: gameConfig }],
        type: 'gemfinder',
    });

    const grid = result.result.grid;
    const coordinates = grid.map(g => `${g.x},${g.y}`);
    const uniqueCoordinates = new Set(coordinates);
    t.equal(uniqueCoordinates.size, grid.length, 'All gem placements are unique');
    t.end();
});
*/