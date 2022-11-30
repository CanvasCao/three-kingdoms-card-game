const {differenceBy} = require("lodash/array");

class User {
    constructor(user) {
        this.maxBlood = 4;
        this.currentBlood = 1 || this.maxBlood;
        this.cardId = user.cardId;
        this.userId = user.userId;
        this.cards = [];
        this.pandingCards = [];
        this.isTieSuo = true;
        this.location = user.location;
    }

    removeCards(cards) {
        this.cards = differenceBy(this.cards, cards, 'cardId');
    }

    reduceBlood(number = 1) {
        this.currentBlood = this.currentBlood - number;
    }

    addBlood(number = 1) {
        this.currentBlood = this.currentBlood + number;
    }

    reset() {
        this.cards = [];
        this.pandingCards = [];
        this.weaponCard = null;
        this.shieldCard = null;
        this.plusHorseCard = null;
        this.minusHorseCard = null;
        this.isTieSuo = false;
    }
}

exports.User = User;