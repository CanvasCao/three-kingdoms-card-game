const {CARD_COLOR, CARD_HUASE} = require("../config/cardConfig");
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

const everyoneGetInitialCards = (gameStatus) => {
    Object.keys(gameStatus.players).forEach((playerId) => {
        gameStatus.players[playerId].cards = getCards(gameStatus,4);
    })
}

const getActualCardColor = (actualCard) => {
    let count = 0;
    const map = {
        [CARD_HUASE.HONGTAO]: 1,
        [CARD_HUASE.FANGKUAI]: 1,
        [CARD_HUASE.CAOHUA]: -1,
        [CARD_HUASE.HEITAO]: -1,
    }
    count = count + map[actualCard.huase] + (map[actualCard.huase2] || 0);
    if (count > 0) {
        return CARD_COLOR.RED;
    } else if (count == 0) {
        return CARD_COLOR.NO;
    } else {
        return CARD_COLOR.BLACK;
    }
}

exports.throwCards = throwCards;
exports.getCards = getCards;
exports.everyoneGetInitialCards = everyoneGetInitialCards;
exports.getActualCardColor = getActualCardColor;