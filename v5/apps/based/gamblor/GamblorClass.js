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
            default:
                const highRollResult = this._handleHighRoll(bets);
                gameResult = highRollResult.roll;
                winners = [bets[highRollResult.index]];
                break;
        }

        const lastResult = this.ramblor.getHistory(-1);

        return {
            winners: winners.map(w => w.buddy),
            result: gameResult,
            amount: totalAmount,
            ramblorResult: lastResult,
            bets
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
            roll: this.ramblor.roll(1, 100).value
        }));
        results.sort((a, b) => b.roll - a.roll);
        return results[0];
    }

    prove(betResult) {
        console.log('Gamblor.prove', betResult);
        return this.ramblor.prove(betResult.ramblorResult);
    }
}
