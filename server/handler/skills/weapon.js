const {findOnGoingEvent} = require("../../event/utils");
const {findOnGoingEventSkill} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");
const {throwCards} = require("../../utils/cardUtils")

const handleCiXiongShuangGuJianResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];

    const onGoingUseStrikeEvent = findOnGoingEvent(gameStatus,ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
    const onGoingUseStrikeEventSkill = findOnGoingEventSkill(gameStatus,ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);

    if (!chooseToReleaseSkill) {
        if (onGoingUseStrikeEventSkill.chooseToReleaseSkill === undefined) {
            // 放弃CiXiongShuangGuJian
        } else {
            // 不弃牌伤害来源摸一张
            gameStatus.players[onGoingUseStrikeEvent.originId].drawCards(gameStatus,1)
        }
        onGoingUseStrikeEventSkill.done = true;
        return
    }

    if (onGoingUseStrikeEventSkill.chooseToReleaseSkill === undefined) {
        onGoingUseStrikeEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
        gameStatus.skillResponse.playerId = onGoingUseStrikeEvent.targetId;// 修改技能使用人的目标
    } else {
        originPlayer.removeCards(response.cards);
        throwCards(gameStatus, response.cards);

        onGoingUseStrikeEventSkill.releaseCards = response.cards
        onGoingUseStrikeEventSkill.done = true;

        delete gameStatus.skillResponse
    }
}

const handleQiLinGongResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const onGoingDamageEventSkill = findOnGoingEventSkill(gameStatus,ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENT);

    if (!chooseToReleaseSkill) {
        onGoingDamageEventSkill.done = true;
        return
    }

    if (onGoingDamageEventSkill.chooseToReleaseSkill === undefined) {
        onGoingDamageEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
    } else {
        // 在CardBoard
        // onGoingDamageEventSkill.done = true;
        // 不能删除 gameStatus.skillResponse
    }
}

exports.handleCiXiongShuangGuJianResponse = handleCiXiongShuangGuJianResponse;
exports.handleQiLinGongResponse = handleQiLinGongResponse;
