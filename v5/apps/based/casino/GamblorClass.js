import Ramblor from "../ramblor/RamblorClass.js";

export default class Gamblor {
    constructor() {
        this.ramblor = new Ramblor();
    }

    bet({ bets, type = 'highroll' }) {
        const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
        const seeds = bets.map(bet => bet.seed || '').filter(Boolean);

        if (seeds.length) {
            this.ramblor.seed(...seeds);
        }

        let winners = [], gameResult;

        switch (type) {
            case 'coinflip':
                gameResult = this._handleCoinFlip(bets);
                winners = bets
                    .map((bet, index) => ({ ...bet, index }))
                    .filter(bet => bet.bet === gameResult);
                break;

            case 'highroll':
                const highRollResults = this._handleHighRoll(bets);
                highRollResults.forEach((result, index) => {
                    bets[index] = {
                        ...bets[index],
                        bet: result.bet,
                        index: result.index,
                    };
                });
                gameResult = highRollResults;
                bets = bets.sort((a, b) => b.bet - a.bet);
                const highestBet = Math.max(...highRollResults.map(r => r.bet));
                winners = highRollResults.filter(r => r.bet === highestBet);
                break;

            case 'gemfinder':
                gameResult = this._handleGemFinder(bets);
                // Winners are determined by API (players who find gems), initially empty
                winners = [];
                // Bets are updated by API with click data, initially unchanged
                bets = bets.map(bet => ({ ...bet, clicks: [] }));
                break;

            default:
                throw new Error(`Unknown bet type: ${type}`);
        }

        const lastResult = this.ramblor.getHistory(-1);

        return {
            winners,
            result: gameResult,
            amount: totalAmount,
            ramblorResult: lastResult,
            bets,
        };
    }

    _handleCoinFlip(bets) {
        let toss = this.ramblor.toss();
        const result = toss.value ? 'heads' : 'tails';
        return result;
    }

    _handleHighRoll(bets) {
        const results = bets.map((_, index) => ({
            index,
            buddy: bets[index].buddy,
            amount: bets[index].amount,
            bet: this.ramblor.roll(1, 100).value,
        }));
        return results;
    }

    _handleGemFinder(bets) {
        const bet = bets[0]; // Assume single bet for game creation
        const { game_config } = bet;
        const { grid_size, gems } = game_config;

        // Parse grid size (e.g., '5x5')
        const [rows, cols] = grid_size.split('x').map(Number);
        const totalSquares = rows * cols;
        const totalGems = gems.reduce((sum, g) => sum + g.count, 0);
        if (totalSquares < totalGems) {
            throw new Error('Grid too small for number of gems');
        }

        // Generate gem locations
        const gemLocations = [];
        const availableSquares = Array.from({ length: totalSquares }, (_, i) => ({
            x: Math.floor(i / cols),
            y: i % cols,
        }));

        // Place gems randomly
        for (const gemType of gems) {
            for (let i = 0; i < gemType.count; i++) {
                if (availableSquares.length === 0) {
                    throw new Error('Not enough squares to place all gems');
                }
                const index = this.ramblor.roll(0, availableSquares.length - 1).value;
                const { x, y } = availableSquares.splice(index, 1)[0];
                gemLocations.push({ x, y, multiplier: gemType.multiplier, buddy: null });
            }
        }

        return {
            grid: gemLocations, // Array of { x, y, multiplier, buddy (null until found) }
            grid_size,
        };
    }

    prove(betResult) {
        console.log('Gamblor.prove', betResult);
        return this.ramblor.prove(betResult.ramblorResult);
    }
}