const {ACTION} = require("../action/action");
const {clearNextCardBoardResponse} = require("../utils/responseUtils");
const {ALL_EVENTS_KEY_CONFIG} = require("../config/eventConfig");
const {findOnGoingEventSkill} = require("../event/utils");
const {CARD_BOARD_ACTION_TYPE} = require("../config/cardBoardConfig");
const cardBoardHandler = {
    handleCardBoard(gameStatus, data) {
        const {card, originId, targetId, action} = data;
        const originPlayer = gameStatus.players[originId]
        const targetPlayer = gameStatus.players[targetId]

        if (action == CARD_BOARD_ACTION_TYPE.REMOVE) {
            ACTION.remove(gameStatus, originPlayer, targetPlayer, card)
        } else if (action == CARD_BOARD_ACTION_TYPE.MOVE) {
            ACTION.move(gameStatus, originPlayer, targetPlayer, card)
        }

        // 反馈 麒麟弓 寒冰剑
        const onGoingDamageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);
        if (onGoingDamageEventSkill) {
            onGoingDamageEventSkill.done = true;
        }

        clearNextCardBoardResponse(gameStatus)
        if (gameStatus.cardBoardResponses[0]) {
            const targetPlayerId = gameStatus.cardBoardResponses[0].targetId
            if (!gameStatus.players[targetPlayerId].hasAnyCards()) {
                gameStatus.cardBoardResponses = [];
            }
        }
    }
}

exports.cardBoardHandler = cardBoardHandler;