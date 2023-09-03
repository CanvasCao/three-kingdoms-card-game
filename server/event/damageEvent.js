const {DAMAGE_EVENT_TIMING} = require("../config/eventConfig");
const {generateQiuTaoResponses} = require("../utils/taoUtils");
const {findNextUnDoneSkillInLastEventTimingsWithSkills} = require("./utils");
const {setEventSkillResponse} = require("./utils");
const {findAllEventSkillsByTimingNameAndActionCard} = require("./utils");
const {last} = require("lodash");

const generateDamageEventThenSetNextDamageEventSkill = (gameStatus, {
    damageCards, // 渠道
    damageActualCard, // 渠道
    damageSkill, // 渠道
    damageAttribute = null,// 属性
    originId,// 来源
    targetId,// 受到伤害的角色
    damageNumber = 1,// 伤害值
    // isTieSuo = false // 是否为连环伤害
}) => {
    gameStatus.damageEvent = {
        damageCards, // 渠道
        damageActualCard, // 渠道
        damageSkill, // 渠道
        damageAttribute,// 属性
        originId,// 来源
        targetId,// 受到伤害的角色
        damageNumber,// 伤害值
        // isTieSuo, // 是否为连环伤害
        eventTimingsWithSkills: [],
        done: false,
    }

    setNextDamageEventSkill(gameStatus);
}

const setNextDamageEventSkill = (gameStatus) => {
    const damageEvent = gameStatus.damageEvent;
    if (!damageEvent) {
        return;
    }

    const {originId, targetId, damageActualCard} = damageEvent;
    const actionCardKey = damageActualCard?.key

    const originPlayer = gameStatus.players[originId]
    const targetPlayer = gameStatus.players[targetId]

    const eventTimingsWithSkills = damageEvent.eventTimingsWithSkills;

    if (eventTimingsWithSkills.length == 0) {
        const eventTimingName = DAMAGE_EVENT_TIMING.WHEN_CAUSE_DAMAGE // 【麒麟弓】、【寒冰剑】
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, actionCardKey, originId, targetId})
        damageEvent.eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == DAMAGE_EVENT_TIMING.WHEN_CAUSE_DAMAGE) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            const eventTimingName = DAMAGE_EVENT_TIMING.WHEN_TAKE_DAMAGE //【天香】
            const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, targetId})
            damageEvent.eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                setEventSkillResponse(gameStatus, eventTimingSkills[0])
                return;
            } else {
                // WHEN_TAKE_DAMAGE结束 扣减体力
                const extraDamageNumber = originPlayer ? (originPlayer.extraDamageMap[damageActualCard.key] || 0) : 0
                const damageNumber = damageEvent.damageNumber + extraDamageNumber
                targetPlayer.reduceBlood(damageNumber)
                // 求桃
                generateQiuTaoResponses(gameStatus, targetPlayer)
            }
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == DAMAGE_EVENT_TIMING.WHEN_TAKE_DAMAGE) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            const eventTimingName = DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE // 【奸雄】、【反馈】、【刚烈】、【遗计】
            const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, targetId, originId})
            damageEvent.eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                setEventSkillResponse(gameStatus, eventTimingSkills[0])
                return;
            }
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            // 伤害事件结束
            setStatusWhenDamageEventDone(gameStatus);
            handleDamageEventEnd(gameStatus);
        }
    }
}

const setStatusWhenDamageEventDone = (gameStatus) => {
    const damageEvent = gameStatus.damageEvent;
    // damageEvent.done = true;
    // generateTieSuoTempStorageByShaAction(gameStatus);
    // generateTieSuoTempStorageByShandian(gameStatus);
}

const handleDamageEventEnd = (gameStatus) => {
    delete gameStatus.damageEvent;
}


exports.generateDamageEventThenSetNextDamageEventSkill = generateDamageEventThenSetNextDamageEventSkill;
exports.setNextDamageEventSkill = setNextDamageEventSkill;
