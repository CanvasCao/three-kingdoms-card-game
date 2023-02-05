const {throwCards} = require("../utils/cardUtils")
const {clearNextScrollStage} = require("../utils/clearResStageUtils")
const cardBoardHandler = {
    handleCardBoard(gameStatus, data) {
        const {card, originId, targetId, type} = data;
        gameStatus.players[targetId].removeCards(card);
        if (type == "REMOVE") {
            throwCards(gameStatus, card);
        } else if (type == "MOVE") {
            gameStatus.players[originId].addCards(card);
        }
        clearNextScrollStage(gameStatus)
    }
}

exports.cardBoardHandler = cardBoardHandler;