const {DAMAGE_EVENT_TIMING} = require("../config/eventConfig");
const {CARD_CONFIG} = require("../config/cardConfig");
const {USE_EVENT_TIMING} = require("../config/eventConfig");
const {getAllPlayersStartFromFirstLocation} = require("../utils/playerUtils");
const {SKILLS} = require("../config/skillsConfig");
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
//                         "skillName": "铁骑",
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
        skillName: configSkill.name,
        playerId,
        chooseToReleaseSkill: undefined,
        done: false,
        boardObserveId: uuidv4(),
    }
}

const setEventSkillResponse = (gameStatus, skill) => {
    gameStatus.skillResponse = JSON.parse(JSON.stringify(skill));
}

const findNextUnDoneSkillInLastEventTimingsWithSkills = (eventTimingsWithSkills) =>
    last(eventTimingsWithSkills).eventTimingSkills.find((eventTimingSkill) => !eventTimingSkill.done)


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

const findOnGoingPandingEvent = (gameStatus) => {
    return gameStatus?.pandingEvent
}

const findOnGoingPandingEventSkill = (gameStatus) => {
    const eventTiming = gameStatus?.pandingEvent?.eventTimingsWithSkills.find((et) => et.eventTimingSkills.some((s) => s.done === false))

    const onGoingPandingEventSkill = eventTiming?.eventTimingSkills.find((s) => s.done === false)
    return onGoingPandingEventSkill
}

const findAllEventSkillsByTimingName = (gameStatus, {eventTimingName, originId, targetId}) => {
    const originPlayer = gameStatus.players[originId];
    const originHeroId = originPlayer?.heroId;
    const originPlayerId = originPlayer?.playerId;
    const targetPlayer = gameStatus.players?.[targetId];
    const targetHeroId = targetPlayer?.heroId;
    const targetPlayerId = targetPlayer?.playerId;

    let eventTimingSkills = [];
    // 判定 相关技能
    if (eventTimingName == PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT) {
        const allPlayers = getAllPlayersStartFromFirstLocation(gameStatus, gameStatus.players[originId].location)
        allPlayers.forEach((player) => {
            const eventSkillsForPlayer = SKILLS[player.heroId]
                .filter((skill) => skill.triggerTiming == eventTimingName)
                .map((skill) => configSkillToSkillResponseSkill(skill, player.playerId))
            eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
        })
    } else if (eventTimingName == PANDING_EVENT_TIMING.AFTER_PANDING_TAKE_EFFECT) {
        const eventSkillsForPlayer = SKILLS[originHeroId]
            .filter((skill) => skill.triggerTiming == eventTimingName)
            .map((skill) => configSkillToSkillResponseSkill(skill, originPlayer.playerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
    }

    // 杀 相关技能
    else if (eventTimingName == USE_EVENT_TIMING.WHEN_BECOMING_TARGET) {
        const eventSkillsForPlayer = SKILLS[targetHeroId]
            .filter((skill) => skill.triggerTiming == eventTimingName && skill.triggerCardName == CARD_CONFIG.SHA.CN)
            .map((skill) => configSkillToSkillResponseSkill(skill, targetPlayerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
    } else if (eventTimingName == USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET) {
        const eventSkillsForPlayer = SKILLS[originHeroId]
            .filter((skill) => skill.triggerTiming == eventTimingName && skill.triggerCardName == CARD_CONFIG.SHA.CN)
            .map((skill) => configSkillToSkillResponseSkill(skill, originPlayerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)

        // 雌雄双股剑
        // if (originPlayer.gender !== targetPlayer.gender) {
        //     eventTimingSkills = eventTimingSkills.concat({
        //         skillName: '雌雄双股剑',
        //         playerId: originPlayer.playerId,
        //         chooseToReleaseSkill: undefined,
        //     })
        // }
    }

    // 伤害
    else if (eventTimingName == DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE) {
        const eventSkillsForPlayer = SKILLS[targetHeroId]
            .filter((skill) => skill.triggerTiming == eventTimingName)
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
exports.findOnGoingUseStrikeEventSkill = findOnGoingUseStrikeEventSkill;
exports.findOnGoingPandingEventSkill = findOnGoingPandingEventSkill;
exports.setEventSkillResponse = setEventSkillResponse;
exports.findNextUnDoneSkillInLastEventTimingsWithSkills = findNextUnDoneSkillInLastEventTimingsWithSkills;