const {clearNextCardBoardResponse} = require("../utils/responseUtils");
const {ALL_EVENTS_KEY_CONFIG} = require("../config/eventConfig");
const {findOnGoingEventSkill} = require("../event/utils");
const {clearSkillResponse} = require("../utils/responseUtils");
const {CARD_BOARD_ACTION_TYPE} = require("../config/cardBoardConfig");
const {throwCards} = require("../utils/cardUtils")
const cardBoardHandler = {
    handleCardBoard(gameStatus, data) {
        const {card, originId, targetId, type} = data;
        gameStatus.players[targetId].removeCards(card);
        if (type == CARD_BOARD_ACTION_TYPE.REMOVE) {
            throwCards(gameStatus, card);
        } else if (type == CARD_BOARD_ACTION_TYPE.MOVE) {
            gameStatus.players[originId].addCards(card);
        }

        // 反馈 麒麟弓
        if (gameStatus.skillResponse) {
            const onGoingDamageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENT);
            if (onGoingDamageEventSkill) {
                onGoingDamageEventSkill.done = true;
            }
            clearSkillResponse(gameStatus);
        }
        // 顺拆
        clearNextCardBoardResponse(gameStatus)
    }
}

exports.cardBoardHandler = cardBoardHandler;