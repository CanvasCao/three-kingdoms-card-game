const {ALL_EVENTS_KEY_CONFIG} = require("../config/eventConfig");
const {findOnGoingEventSkill} = require("../event/utils");
const {clearSkillResponse} = require("../utils/responseUtils");
const {CARD_BOARD_ACTION_TYPE} = require("../config/cardBoardConfig");
const {throwCards} = require("../utils/cardUtils")
const {clearNextScrollResponse} = require("../utils/responseUtils")
const cardBoardHandler = {
    handleCardBoard(gameStatus, data) {
        const {card, originId, targetId, type} = data;
        gameStatus.players[targetId].removeCards(card);
        if (type == CARD_BOARD_ACTION_TYPE.REMOVE) {
            throwCards(gameStatus, card);
        } else if (type == CARD_BOARD_ACTION_TYPE.MOVE) {
            gameStatus.players[originId].addCards(card);
        }

        // 反馈
        if (gameStatus.skillResponse) {
            const onGoingDamageEventSkill = findOnGoingEventSkill(gameStatus,ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENT);
            onGoingDamageEventSkill.done = true;
            clearSkillResponse(gameStatus);
        }
        // 顺拆
        else {
            clearNextScrollResponse(gameStatus)
        }
    }
}

exports.cardBoardHandler = cardBoardHandler;