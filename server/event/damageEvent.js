const {ACTION} = require("../action/action");
const {SKILL_CONFIG} = require("../config/skillsConfig");
const {findOnGoingEvent} = require("./utils");
const {DAMAGE_EVENT_TIMING} = require("../config/eventConfig");
const {generateQiuTaoResponses} = require("../utils/taoUtils");
const {findNextUnDoneSkillInLastEventTimingsWithSkills} = require("./utils");
const {setEventSkillResponse} = require("./utils");
const {findAllEventSkillsByTimingNameAndActionCard} = require("./utils");
const {last} = require("lodash");
const {ALL_EVENTS_KEY_CONFIG} = require("../config/eventConfig");

const generateDamageEventThenSetNextDamageEventSkill = (gameStatus, {
    damageCards = [], // 渠道
    damageActualCard, // 渠道
    damageSkill, // 渠道
    damageAttribute = null,// 属性
    originId,// 来源
    targetId,// 受到伤害的角色
    damageNumber = 1,// 伤害值
    // isTieSuo = false // 是否为连环伤害
}) => {
    const newDamageEvent = {
        damageCards, // 渠道
        damageActualCard, // 渠道
        damageSkill, // 渠道
        damageAttribute,// 属性
        originId,// 来源
        targetId,// 受到伤害的角色
        damageNumber,// 伤害值
        amendDamageNumber: damageNumber,// 调整以后的伤害值
        // isTieSuo, // 是否为连环伤害
        eventTimingTracker: [],
        done: false,
    }
    if (gameStatus.damageEvents) {
        gameStatus.damageEvents.push(newDamageEvent)
    } else {
        gameStatus.damageEvents = [newDamageEvent]
    }
    setNextDamageEventSkill(gameStatus);
}

const setNextDamageEventSkill = (gameStatus) => {
    const damageEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS)
    if (!damageEvent) {
        return;
    }

    const {originId, targetId, damageActualCard, damageSkill, eventTimingTracker, damageNumber} = damageEvent;
    const damageActualCardKey = damageActualCard?.key
    const originPlayer = gameStatus.players[originId]
    const targetPlayer = gameStatus.players[targetId]

    if (eventTimingTracker.length == 0) {
        const eventTimingName = DAMAGE_EVENT_TIMING.WHEN_CAUSE_DAMAGE // 【麒麟弓】、【寒冰剑】
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {
            eventTimingName,
            actionCardKey: damageActualCardKey,
            originId,
            targetId
        })
        damageEvent.eventTimingTracker.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingTracker).eventTimingName == DAMAGE_EVENT_TIMING.WHEN_CAUSE_DAMAGE) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingTracker)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            const eventTimingName = DAMAGE_EVENT_TIMING.WHEN_TAKE_DAMAGE //【天香】
            const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, targetId})
            damageEvent.eventTimingTracker.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                setEventSkillResponse(gameStatus, eventTimingSkills[0])
                return;
            } else {
                // WHEN_TAKE_DAMAGE结束 扣减体力
                const extraDamageNumber = originPlayer ? (originPlayer.extraDamageMap[damageActualCardKey] || 0) : 0
                damageEvent.amendDamageNumber = damageEvent.damageNumber + extraDamageNumber
                targetPlayer.reduceBlood(damageEvent.amendDamageNumber)
                // 求桃
                if (targetPlayer.currentBlood <= 0) {
                    generateQiuTaoResponses(gameStatus, targetPlayer)
                    return
                }
            }
        }
    }

    if (last(eventTimingTracker).eventTimingName == DAMAGE_EVENT_TIMING.WHEN_TAKE_DAMAGE) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingTracker)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            // 苦肉摸牌
            if (damageSkill == SKILL_CONFIG.WU004_KU_ROU.key && !originPlayer.isDead) {
                ACTION.draw(gameStatus, originPlayer)
            }

            const eventTimingName = DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE // 【奸雄】、【反馈】、【刚烈】、【遗计】
            const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {
                eventTimingName,
                targetId,
                originId,
                damageNumber: damageEvent.amendDamageNumber
            })
            damageEvent.eventTimingTracker.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                setEventSkillResponse(gameStatus, eventTimingSkills[0])
                return;
            }
        }
    }

    if (last(eventTimingTracker).eventTimingName == DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingTracker)
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
    const damageEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);
    damageEvent.done = true;
    // generateTieSuoTempStorageByShaAction(gameStatus);
    // generateTieSuoTempStorageByShandian(gameStatus);
}

const handleDamageEventEnd = (gameStatus) => {
    if (gameStatus.damageEvents.every((e) => e.done)) {
        delete gameStatus.damageEvents;
    } else {
        setNextDamageEventSkill(gameStatus)
    }
}


exports.generateDamageEventThenSetNextDamageEventSkill = generateDamageEventThenSetNextDamageEventSkill;
exports.setNextDamageEventSkill = setNextDamageEventSkill;
