const {DELAY_SCROLL_CARDS_CONFIG} = require("../initCards")

const throwCards = (gameStatus, cards) => {
    gameStatus.throwedCards = gameStatus.throwedCards.concat(cards);
}

const getCards = (gameStatus, number = 2) => {
    // hardcode 补牌
    if (gameStatus.initCards.length < 2) {
        console.log("补牌")
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