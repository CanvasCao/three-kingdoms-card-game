const {generatePandingEventThenSetNextPandingEventSkill} = require("../../event/pandingEvent");
const {SKILL_CONFIG} = require("../../config/skillsConfig");
const {generateDamageEventThenSetNextDamageEventSkill} = require("../../event/damageEvent");
const {findOnGoingEventSkill} = require("../../event/utils");
const {findOnGoingEvent} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");
const {ACTION} = require("../../action/action")

const handleWei003GangLieResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];

    const onGoingDamageEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);
    const onGoingDamageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);

    if (!chooseToReleaseSkill) {
        if (onGoingDamageEventSkill.chooseToReleaseSkill === undefined) {
            // 放弃刚烈
            onGoingDamageEventSkill.done = true;
        } else {
            // 不弃牌夏侯惇对来源造成一点伤害
            onGoingDamageEventSkill.done = true; // 顺序一定要在generate之前
            generateDamageEventThenSetNextDamageEventSkill(gameStatus, {
                damageCards: [],
                damageActualCard: null, // 渠道
                damageSkill: SKILL_CONFIG.WEI003_GANG_LIE.key,
                originId: onGoingDamageEvent.targetId,
                targetId: onGoingDamageEvent.originId,
            })
        }
        return
    }

    if (onGoingDamageEventSkill.chooseToReleaseSkill === undefined) {
        onGoingDamageEventSkill.chooseToReleaseSkill = chooseToReleaseSkill

        // 这里会插入司马懿的鬼才 但是由于onGoingDamageEventSkill没有done 所以司马懿的鬼才执行结束依然会回到刚烈
        generatePandingEventThenSetNextPandingEventSkill(gameStatus, {
            originId: onGoingDamageEvent.targetId,
            pandingNameKey: onGoingDamageEventSkill.skillKey
        })
    } else {
        ACTION.discard(gameStatus,originPlayer,response.cards)

        onGoingDamageEventSkill.releaseCards = response.cards
        onGoingDamageEventSkill.done = true;

        delete gameStatus.skillResponse
    }
}


exports.handleWei003GangLieResponse = handleWei003GangLieResponse;
