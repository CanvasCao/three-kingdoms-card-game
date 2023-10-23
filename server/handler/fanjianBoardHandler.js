const {generateDamageEventThenSetNextDamageEventSkill} = require("../event/damageEvent");
const {sampleSize} = require("lodash/collection");
const {clearFanJianBoardResponse} = require("../utils/responseUtils");
const {ACTION} = require("../action/action");
const {getCurrentPlayer} = require("../utils/playerUtils");

const fanjianBoardHandler = {
    handleFanJianBoard(gameStatus, data) {
        const originPlayer = getCurrentPlayer(gameStatus)
        const targetPlayer = gameStatus.players[gameStatus.fanjianBoardResponse.originId]

        if (originPlayer.cards.length <= 0) {
            return
        }

        const cards = sampleSize(originPlayer.cards);
        ACTION.give(gameStatus, originPlayer, targetPlayer, cards, true)

        if (cards[0]?.huase !== data.huase) {
            generateDamageEventThenSetNextDamageEventSkill(gameStatus, {
                originId: originPlayer.playerId,// 来源
                targetId: targetPlayer.playerId
            })
        }

        clearFanJianBoardResponse(gameStatus);
    }
}

exports.fanjianBoardHandler = fanjianBoardHandler;