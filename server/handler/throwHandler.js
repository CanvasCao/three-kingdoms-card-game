const {emitRefreshStatus} = require("../utils/emitUtils");
const {getCurrentPlayer} = require("../utils/playerUtils");
const {throwCards} = require("../utils/cardUtils")
const {goToNextStage} = require("../utils/stageUtils")
const throwHandler = {
    handleThrowCards(gameStatus, data) {
        const cards = data.cards;
        getCurrentPlayer(gameStatus).removeHandCards(cards);
        throwCards(gameStatus, cards);

        emitRefreshStatus(gameStatus);
        goToNextStage(gameStatus);
    }
}

exports.throwHandler = throwHandler;