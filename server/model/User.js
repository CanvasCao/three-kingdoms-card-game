const {differenceBy} = require("lodash/array");

class User {
    constructor(user, generateNewRoundQiuTaoResponseStages) {
        this.maxBlood = 4;
        this.currentBlood = 1 || this.maxBlood;
        this.cardId = user.cardId;
        this.userId = user.userId;
        this.name = user.name;
        this.location = user.location;

        // cards
        this.cards = [];
        this.pandingCards = [];

        // tags
        this.isTieSuo = true;

        // delay scroll
        this.skipDraw = false;
        this.skipPlay = false;

        // skills
        this.skills = [
            {triggerStage: '', name: ''},
        ]

        // 耦合 掉血和求桃
        this.generateNewRoundQiuTaoResponseStages = generateNewRoundQiuTaoResponseStages;
    }

    addCards(cards) {
        this.cards = this.cards.concat(cards)
    }

    removeCards(cards) {
        this.cards = differenceBy(this.cards, cards, 'cardId');
    }

    removePandingCard(card) {
        this.pandingCards = differenceBy(this.pandingCards, [card], 'cardId');
    }

    reduceBlood(number = 1) {
        this.currentBlood = this.currentBlood - number;
        if (this.currentBlood <= 0) {
            this.generateNewRoundQiuTaoResponseStages(this);
        }
    }

    addBlood(number = 1) {
        this.currentBlood = this.currentBlood + number;
    }

    resetWhenDie() {
        this.cards = [];
        this.pandingCards = [];
        this.weaponCard = null;
        this.shieldCard = null;
        this.plusHorseCard = null;
        this.minusHorseCard = null;
        this.isTieSuo = false;
    }

    resetWhenMyTurnEnds() {
        this.skipDraw = false;
        this.skipPlay = false;
    }

    needThrow() {
        return this.cards.length > this.currentBlood
    }
}

exports.User = User;