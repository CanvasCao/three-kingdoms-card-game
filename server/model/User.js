const {differenceBy} = require("lodash/array");

class User {
    constructor(user) {
        this.maxBlood = 4;
        this.currentBlood = 2 || this.maxBlood;
        this.cardId = user.cardId;
        this.userId = user.userId;
        this.cards = [];
        this.location = user.location;
    }

    removeCards(cards) {
        this.cards = differenceBy(this.cards, cards, 'cardId');
    }
}

exports.User = User;