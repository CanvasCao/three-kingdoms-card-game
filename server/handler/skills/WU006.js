const {findOnGoingEventSkill} = require("../../event/utils");
const {findOnGoingEvent} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");
const {emitNotifyAddLines} = require("../../utils/emitUtils");
const {ACTION} = require("../../action/action")

const handleWu006LiuLiResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];

    const onGoingUseStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
    const onGoingUseStrikeEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);

    if (!chooseToReleaseSkill) {
        onGoingUseStrikeEventSkill.done = true;
        return
    }

    if (onGoingUseStrikeEventSkill.chooseToReleaseSkill === undefined) {
        onGoingUseStrikeEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
    } else {
        ACTION.discard(gameStatus, originPlayer, response.cards)
        emitNotifyAddLines(gameStatus, {
            fromId: onGoingUseStrikeEvent.targetId,
            toIds: response.skillTargetIds
        });

        onGoingUseStrikeEvent.targetId = response.skillTargetIds[0];

        onGoingUseStrikeEventSkill.releaseTargetIds = response.skillTargetIds
        onGoingUseStrikeEventSkill.releaseCards = response.cards // 最后结算弃牌的时候需要
        onGoingUseStrikeEventSkill.done = true;

        delete gameStatus.skillResponse
    }
}


exports.handleWu006LiuLiResponse = handleWu006LiuLiResponse;
