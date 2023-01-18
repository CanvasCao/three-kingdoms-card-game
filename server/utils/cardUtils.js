const {Card} = require("../model/Card");
const {getInitCards} = require("../initCards")

const throwCards = (gameStatus, cards) => {
    if (!cards) {
        return
    }
    let throwingCards = Array.isArray(cards) ? cards : [cards]
    throwingCards = throwingCards.map(c => new Card(c))
    gameStatus.throwedCards = gameStatus.throwedCards.concat(throwingCards);
}

const getCards = (gameStatus, number = 2) => {
    // TODO hardcode 补牌
    if (gameStatus.initCards.length < number) {
        // console.log("补牌")
        gameStatus.initCards = getInitCards()
    }

    if (number > 1) {
        let cards = [];
        for (let i = 1; i <= number; i++) {
            cards.push(JSON.parse(JSON.stringify(gameStatus.initCards.shift())))
        }
        return cards;
    } else {
        return JSON.parse(JSON.stringify(gameStatus.initCards.shift()))
    }
}

exports.throwCards = throwCards;
exports.getCards = getCards;