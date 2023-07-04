const {clearSkillResponse} = require("../utils/clearResponseUtils");
const {CARD_BOARD_ACTION_TYPE} = require("../config/cardBoardConfig");
const {throwCards} = require("../utils/cardUtils")
const {clearNextScrollResponse} = require("../utils/clearResponseUtils")
const cardBoardHandler = {
    handleCardBoard(gameStatus, data) {
        const {card, originId, targetId, type} = data;
        gameStatus.players[targetId].removeCards(card);
        if (type == CARD_BOARD_ACTION_TYPE.REMOVE) {
            throwCards(gameStatus, card);
        } else if (type == CARD_BOARD_ACTION_TYPE.MOVE) {
            gameStatus.players[originId].addCards(card);
        }

        // 顺拆
        if(gameStatus.scrollResponses?.[0]){
            clearNextScrollResponse(gameStatus)
        }
        // 反馈
        clearSkillResponse(gameStatus);
    }
}

exports.cardBoardHandler = cardBoardHandler;