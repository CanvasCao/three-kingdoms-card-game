const {emitRefreshStatus} = require("../utils/utils");
const {throwCards} = require("../utils/cardUtils")
const {clearNextScrollStage} = require("../utils/clearStageUtils")
const cardBoardHandler = {
    handleCardBoard(gameStatus, data) {
        const {card, originId, targetId, type} = data;
        gameStatus.users[targetId].removeCards(card);
        if (type == "REMOVE") {
            throwCards(gameStatus, card);
        } else if (type == "MOVE") {
            gameStatus.users[originId].addCards(card);
        }
        clearNextScrollStage(gameStatus)
        emitRefreshStatus(gameStatus);
    }
}

exports.cardBoardHandler = cardBoardHandler;