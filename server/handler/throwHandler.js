const {getCurrentPlayer} = require("../utils/playerUtils");
const {throwCards} = require("../utils/cardUtils")
const throwHandler = {
    handleThrowCards(gameStatus, data) {
        const cards = data.cards;
        getCurrentPlayer(gameStatus).removeCards(cards);
        throwCards(gameStatus, cards);
    }
}

exports.throwHandler = throwHandler;