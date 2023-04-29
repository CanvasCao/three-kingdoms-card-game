const {CARD_BOARD_ACTION_TYPE} = require("../config/cardBoardConfig");
const {throwCards} = require("../utils/cardUtils")
const {clearNextScrollStage} = require("../utils/clearResStageUtils")
const cardBoardHandler = {
    handleCardBoard(gameStatus, data) {
        const {card, originId, targetId, type} = data;
        gameStatus.players[targetId].removeCards(card);
        if (type == CARD_BOARD_ACTION_TYPE.REMOVE) {
            throwCards(gameStatus, card);
        } else if (type == CARD_BOARD_ACTION_TYPE.MOVE) {
            gameStatus.players[originId].addCards(card);
        }
        clearNextScrollStage(gameStatus)
    }
}

exports.cardBoardHandler = cardBoardHandler;