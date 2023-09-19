const {SKILL_CONFIG} = require("../../config/skillsConfig");
const {generateDamageEventThenSetNextDamageEventSkill} = require("../../event/damageEvent");
const {findOnGoingEventSkill} = require("../../event/utils");
const {findOnGoingEvent} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");
const {throwCards} = require("../../utils/cardUtils");

const handleWei003GangLieResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];

    const onGoingDamageEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENT);
    const onGoingDamageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENT);

    if (!chooseToReleaseSkill) {
        if (onGoingDamageEventSkill.chooseToReleaseSkill === undefined) {
            // 放弃刚烈
        } else {
            // 不弃牌夏侯惇对来源造成一点伤害
            generateDamageEventThenSetNextDamageEventSkill(gameStatus, {
                damageCards: [],
                damageActualCard: null, // 渠道
                damageSkill: SKILL_CONFIG.WEI003_GANG_LIE.key,
                originId: onGoingDamageEvent.targetId,// 来源
                targetId: onGoingDamageEvent.originId,
            })
        }
        onGoingDamageEventSkill.done = true;
        return
    }

    if (onGoingDamageEventSkill.chooseToReleaseSkill === undefined) {
        onGoingDamageEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
        gameStatus.skillResponse.playerId = onGoingDamageEvent.originId;// 修改技能使用人的目标
    } else {
        originPlayer.removeCards(response.cards);
        throwCards(gameStatus, response.cards);

        onGoingDamageEventSkill.releaseCards = response.cards
        onGoingDamageEventSkill.done = true;

        delete gameStatus.skillResponse
    }
}


exports.handleWei003GangLieResponse = handleWei003GangLieResponse;
