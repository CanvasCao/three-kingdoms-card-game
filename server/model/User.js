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

        // pandingSigns
        this.pandingSigns = [];
        this.weaponCard = null;
        this.shieldCard = null;
        this.plusHorseCard = null;
        this.minusHorseCard = null;
        // ui tags
        this.isTieSuo = true;

        // tags
        this.judgedShandian = false;

        // delay scroll
        this.skipDraw = false;
        this.skipPlay = false;

        // skills
        this.skills = [
            {triggerStage: '', name: ''},
        ]

        this.isDead = false

        // 耦合 掉血和求桃
        this.generateNewRoundQiuTaoResponseStages = generateNewRoundQiuTaoResponseStages;
    }

    addCards(cards) {
        this.cards = this.cards.concat(cards)
    }

    removeHandCards(cards) {
        const removeCards = Array.isArray(cards) ? cards : [cards]
        this.cards = differenceBy(this.cards, removeCards, 'cardId');
    }

    removeCards(cards) {
        this.removeHandCards(cards)
        const removeCards = Array.isArray(cards) ? cards : [cards]
        const removeCardIds = removeCards.map(c => c.cardId);
        this.weaponCard = removeCardIds.includes(this.weaponCard?.cardId) ? null : this.weaponCard;
        this.shieldCard = removeCardIds.includes(this.shieldCard?.cardId) ? null : this.shieldCard;
        this.plusHorseCard = removeCardIds.includes(this.plusHorseCard?.cardId) ? null : this.plusHorseCard;
        this.minusHorseCard = removeCardIds.includes(this.minusHorseCard?.cardId) ? null : this.minusHorseCard;

        const fakeSigns = removeCardIds.map((rId) => {
            return {
                card: {cardId: rId}
            }
        })
        this.pandingSigns = differenceBy(this.pandingSigns, fakeSigns, 'card.cardId');
    }

    removePandingSign(sign) {
        this.pandingSigns = differenceBy(this.pandingSigns, [sign], 'card.cardId');
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
        this.pandingSigns = [];
        this.weaponCard = null;
        this.shieldCard = null;
        this.plusHorseCard = null;
        this.minusHorseCard = null;
        this.isTieSuo = false;
    }

    resetWhenMyTurnStarts() {
        this.pandingSigns = this.pandingSigns.map((sign) => {
            sign.isEffect = undefined;
            return sign
        })
    }

    resetWhenMyTurnEnds() {
        this.skipDraw = false;
        this.skipPlay = false;
        this.judgedShandian = false;
    }

    needThrow() {
        return this.cards.length > this.currentBlood
    }
}

exports.User = User;