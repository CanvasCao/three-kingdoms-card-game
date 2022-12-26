const {emitRefreshStatus} = require("../utils/utils");
const {getCurrentUser} = require("../utils/userUtils");
const {throwCards} = require("../utils/cardUtils")
const {goToNextStage} = require("../utils/stageUtils")
const throwHandler = {
    handleThrowCards(gameStatus, data) {
        const cards = data.cards;
        getCurrentUser(gameStatus).removeHandCards(cards);
        throwCards(gameStatus, cards);

        emitRefreshStatus(gameStatus);
        goToNextStage(gameStatus);
    }
}

exports.throwHandler = throwHandler;