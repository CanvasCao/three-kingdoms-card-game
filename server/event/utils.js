const {EQUIPMENT_CARDS_CONFIG} = require("../config/cardConfig");
const {DAMAGE_EVENT_TIMING} = require("../config/eventConfig");
const {CARD_CONFIG} = require("../config/cardConfig");
const {USE_EVENT_TIMING} = require("../config/eventConfig");
const {getAllAlivePlayersStartFromFirstLocation} = require("../utils/playerUtils");
const {TIMING_SKILLS_CONFIG} = require("../config/skillsConfig");
const {PANDING_EVENT_TIMING} = require("../config/eventConfig");
const {last} = require("lodash");
const {v4: uuidv4} = require('uuid');

// "useStrikeEvents": [
//     {
//         "originId": "a2511baa-80f8-4e6b-be63-317e902bfa9d",
//         "targetId": "1ea2ff47-b3c1-4b26-aabc-539c754b8076",
//         "cantShan": false,
//         "eventTimingsWithSkills": [
//             {
//                 "eventTimingName": "WHEN_BECOMING_TARGET",
//                 "eventTimingSkills": [
//
//                 ]
//             },
//             {
//                 "eventTimingName": "AFTER_SPECIFYING_TARGET",
//                 "eventTimingSkills": [
//                     {
//                         "skillNameKey": "铁骑",
//                         "playerId": "a2511baa-80f8-4e6b-be63-317e902bfa9d",
//                         "chooseToReleaseSkill": false
//                          releaseTargetIds: [],
//                          releaseCards: [],
//                          done: false,
//                     }
//                 ]
//             }
//         ],
//         "done": false
//     }
// ]

const configSkillToSkillResponseSkill = (configSkill, playerId) => {
    return {
        skillNameKey: configSkill.key,
        playerId,
        chooseToReleaseSkill: undefined,
        done: false,
    }
}

const setEventSkillResponse = (gameStatus, skill) => {
    gameStatus.skillResponse = JSON.parse(JSON.stringify(skill));
}

// UnDoneSkill
const findNextUnDoneSkillInLastEventTimingsWithSkills = (gameStatus, eventTimingsWithSkills) => {
    const eventTimingSkills = last(eventTimingsWithSkills).eventTimingSkills

    // 找到没有放而且释放角色还没有阵亡的技能
    return eventTimingSkills.find((eventTimingSkill) => {
        const needReleaseSkillPlayer = gameStatus.players[eventTimingSkill.playerId];
        return !eventTimingSkill.done && !needReleaseSkillPlayer.isDead
    })
}


// UseStrikeEvent
const findOnGoingUseStrikeEvent = (gameStatus) => {
    const useStrikeEvent = gameStatus?.useStrikeEvents.find((event) => !event.done)
    return useStrikeEvent
}

const findOnGoingUseStrikeEventSkill = (gameStatus) => {
    const useStrikeEvent = findOnGoingUseStrikeEvent(gameStatus)
    const eventTimingsWithSkills = useStrikeEvent?.eventTimingsWithSkills;
    const eventTiming = eventTimingsWithSkills.find((et) => et.eventTimingSkills.some((s) => s.done === false))

    const onGoingUseStrikeEventSkill = eventTiming?.eventTimingSkills.find((s) => s.done === false)
    return onGoingUseStrikeEventSkill
}

// playEvent
const findOnGoingPlayEvent = (gameStatus) => {
    const playEvent = gameStatus?.playEvents.find((event) => !event.done)
    return playEvent
}

const findOnGoingPlayEventSkill = (gameStatus) => {
    const playEvent = findOnGoingUseStrikeEvent(gameStatus)
    const eventTimingsWithSkills = playEvent?.eventTimingsWithSkills;
    const eventTiming = eventTimingsWithSkills.find((et) => et.eventTimingSkills.some((s) => s.done === false))

    const onGoingPlayEventSkill = eventTiming?.eventTimingSkills.find((s) => s.done === false)
    return onGoingPlayEventSkill
}

// PandingEvent
const findOnGoingPandingEvent = (gameStatus) => {
    return gameStatus?.pandingEvent
}

const findOnGoingPandingEventSkill = (gameStatus) => {
    const eventTiming = gameStatus?.pandingEvent?.eventTimingsWithSkills.find((et) => et.eventTimingSkills.some((s) => s.done === false))

    const onGoingPandingEventSkill = eventTiming?.eventTimingSkills.find((s) => s.done === false)
    return onGoingPandingEventSkill
}

// damage
const findOnGoingDamageEvent = (gameStatus) => {
    return gameStatus?.damageEvent
}

const findOnGoingDamageEventSkill = (gameStatus) => {
    const eventTiming = gameStatus?.damageEvent?.eventTimingsWithSkills.find((et) => et.eventTimingSkills.some((s) => s.done === false))

    const onGoingDamageEventSkill = eventTiming?.eventTimingSkills.find((s) => s.done === false)
    return onGoingDamageEventSkill
}

// AllEventSkills
const findAllEventSkillsByTimingName = (gameStatus, {eventTimingName, originId, targetId}) => {
    const originPlayer = gameStatus.players[originId];
    const originPlayerId = originPlayer?.playerId;
    const targetPlayer = gameStatus.players?.[targetId];
    const targetPlayerId = targetPlayer?.playerId;

    let eventTimingSkills = [];
    // 判定 相关技能
    if (eventTimingName == PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT) {
        const allPlayers = getAllAlivePlayersStartFromFirstLocation(gameStatus, gameStatus.players[originId].location)
        allPlayers.forEach((player) => {
            const eventSkillsForPlayer = player.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
                .filter((skill) => skill && skill.triggerTiming == eventTimingName)
                .map((skill) => configSkillToSkillResponseSkill(skill, player.playerId))
            eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
        })
    } else if (eventTimingName == PANDING_EVENT_TIMING.AFTER_PANDING_TAKE_EFFECT) {
        const eventSkillsForPlayer = originPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
            .filter((skill) => skill && skill.triggerTiming == eventTimingName)
            .map((skill) => configSkillToSkillResponseSkill(skill, originPlayer.playerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
    }

    // 杀 相关技能
    else if (eventTimingName == USE_EVENT_TIMING.WHEN_BECOMING_TARGET) {
        const eventSkillsForPlayer = targetPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
            .filter((skill) => skill && skill.triggerTiming == eventTimingName && skill.triggerCardName == CARD_CONFIG.SHA.key)
            .map((skill) => configSkillToSkillResponseSkill(skill, targetPlayerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
    } else if (eventTimingName == USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET) {
        const eventSkillsForPlayer = originPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
            .filter((skill) => skill && skill.triggerTiming == eventTimingName && skill.triggerCardName == CARD_CONFIG.SHA.key)
            .map((skill) => configSkillToSkillResponseSkill(skill, originPlayerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)

        // 雌雄双股剑
        if (originPlayer.weaponCard) {
            if (originPlayer.weaponCard.key === CARD_CONFIG.CI_XIONG_SHUANG_GU_JIAN.key &&
                originPlayer.gender !== targetPlayer.gender) {
                const skill = configSkillToSkillResponseSkill(
                    {nameKey: EQUIPMENT_CARDS_CONFIG.CI_XIONG_SHUANG_GU_JIAN.key},
                    originPlayer.playerId)
                eventTimingSkills = eventTimingSkills.concat(skill)
            }
        }
    }

    // 伤害
    else if (eventTimingName == DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE) {
        const eventSkillsForPlayer = targetPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
            .filter((skill) => skill && skill.triggerTiming == eventTimingName)
            .filter((skill) => {
                // 如果技能需要来源
                return skill.needOrigin ? !!originId : true
            })
            .filter((skill) => {
                // 如果需要技能来源有卡牌技能需要来源
                return skill.needOriginHasCards ? originPlayer.hasAnyHandCardsOrEquipmentCards() : true
            })
            .map((skill) => configSkillToSkillResponseSkill(skill, targetPlayerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
    }

    return eventTimingSkills;
}


exports.configSkillToEventSkill = configSkillToSkillResponseSkill;
exports.findAllEventSkillsByTimingName = findAllEventSkillsByTimingName;

exports.findOnGoingUseStrikeEvent = findOnGoingUseStrikeEvent;
exports.findOnGoingPandingEvent = findOnGoingPandingEvent;
exports.findOnGoingDamageEvent = findOnGoingDamageEvent;
exports.findOnGoingPlayEvent = findOnGoingPlayEvent;

exports.findOnGoingUseStrikeEventSkill = findOnGoingUseStrikeEventSkill;
exports.findOnGoingPandingEventSkill = findOnGoingPandingEventSkill;
exports.findOnGoingDamageEventSkill = findOnGoingDamageEventSkill;
exports.findOnGoingPlayEventSkill = findOnGoingPlayEventSkill;

exports.setEventSkillResponse = setEventSkillResponse;
exports.findNextUnDoneSkillInLastEventTimingsWithSkills = findNextUnDoneSkillInLastEventTimingsWithSkills;