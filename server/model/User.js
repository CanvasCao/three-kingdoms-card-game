const {differenceBy} = require("lodash/array");

class User {
    constructor(user) {
        this.maxBlood = 4;
        this.currentBlood = this.maxBlood;
        this.cardId = user.cardId;
        this.userId = user.userId;
        this.cards = [];
        this.index = user.index;
    }

    removeCards(cards) {
       this.cards = differenceBy(this.cards, cards, 'cardId');
    }
}

exports.User = User;