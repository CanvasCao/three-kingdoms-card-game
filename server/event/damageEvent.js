const {generateQiuTaoResponses} = require("../utils/taoUtils");
const {findNextUnDoneSkillInLastEventTimingsWithSkills} = require("./utils");
const {setEventSkillResponse} = require("./utils");
const {findAllEventSkillsByTimingNameAndActionCard} = require("./utils");
const {DAMAGE_EVENT_TIMINGS} = require("../config/eventConfig");
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

    let timingIndex = 0;
    if (eventTimingsWithSkills.length == 0) {
        const eventTimingName = DAMAGE_EVENT_TIMINGS[timingIndex] // WHEN_CAUSE_DAMAGE
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, actionCardKey, originId, targetId})
        damageEvent.eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == DAMAGE_EVENT_TIMINGS[timingIndex]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            const eventTimingName = DAMAGE_EVENT_TIMINGS[timingIndex + 1] // WHEN_TAKE_DAMAGE
            const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, targetId})
            damageEvent.eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                setEventSkillResponse(gameStatus, eventTimingSkills[0])
                return;
            } else { // WHEN_TAKE_DAMAGE结束 扣减体力
                targetPlayer.reduceBlood(damageEvent.damageNumber)
                // 求桃
                generateQiuTaoResponses(gameStatus, targetPlayer)
            }
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == DAMAGE_EVENT_TIMINGS[timingIndex + 1]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            const eventTimingName = DAMAGE_EVENT_TIMINGS[timingIndex + 2] // AFTER_CAUSE_DAMAGE
            const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, targetId, originId})
            damageEvent.eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                setEventSkillResponse(gameStatus, eventTimingSkills[0])
                return;
            }
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == DAMAGE_EVENT_TIMINGS[timingIndex + 2]) {
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
