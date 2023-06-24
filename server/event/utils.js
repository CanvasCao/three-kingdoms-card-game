const {CARD_CONFIG} = require("../config/cardConfig");
const {USE_EVENT_TIMING} = require("../config/eventConfig");
const {getAllPlayersStartFromFirstLocation} = require("../utils/playerUtils");
const {SKILLS} = require("../config/skillsConfig");
const {PANDING_EVENT_TIMING} = require("../config/eventConfig");

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
//                             releaseTargets: [],
//                             releaseCards: [],
//                             done: false,
//                     }
//                 ]
//             }
//         ],
//         "done": false
//     }
// ]

const configSkillToEventSkill = (configSkill, playerId) => {
    return {
        skillName: configSkill.name,
        playerId,
        chooseToReleaseSkill: undefined,
        done: false
    }
}

const setEventSkillResponse = (gameStatus, skill) => {
    gameStatus.skillResponse = skill;
}

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

const findOnGoingPandingEvent= (gameStatus) => {
    return gameStatus?.pandingEvent
}

const findOnGoingPandingEventSkill = (gameStatus) => {
    const eventTiming =gameStatus?.pandingEvent?.eventTimingsWithSkills.find((et) => et.eventTimingSkills.some((s) => s.done === false))

    const onGoingPandingEventSkill = eventTiming?.eventTimingSkills.find((s) => s.done === false)
    return onGoingPandingEventSkill
}

const findAllEventSkillsByTimingName = (gameStatus, {eventTimingName, originId, targetId}) => {
    /*
        skillName,
        playerId,
        chooseToReleaseSkill: undefined,
    */
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
                .map((skill) => configSkillToEventSkill(skill, player.playerId))
            eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
        })
    } else if (eventTimingName == PANDING_EVENT_TIMING.AFTER_PANDING_TAKE_EFFECT) {
        const eventSkillsForPlayer = SKILLS[originHeroId]
            .filter((skill) => skill.triggerTiming == eventTimingName)
            .map((skill) => configSkillToEventSkill(skill, originPlayer.playerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
    }

    // 杀 相关技能
    else if (eventTimingName == USE_EVENT_TIMING.WHEN_BECOMING_TARGET) {
        const eventSkillsForPlayer = SKILLS[targetHeroId]
            .filter((skill) => skill.triggerTiming == eventTimingName && skill.triggerCard == CARD_CONFIG.SHA.CN)
            .map((skill) => configSkillToEventSkill(skill, targetPlayerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
    } else if (eventTimingName == USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET) {
        const eventSkillsForPlayer = SKILLS[originHeroId]
            .filter((skill) => skill.triggerTiming == eventTimingName && skill.triggerCard == CARD_CONFIG.SHA.CN)
            .map((skill) => configSkillToEventSkill(skill, originPlayerId))
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
    return eventTimingSkills;
}

exports.configSkillToEventSkill = configSkillToEventSkill;
exports.findAllEventSkillsByTimingName = findAllEventSkillsByTimingName;
exports.findOnGoingUseStrikeEvent = findOnGoingUseStrikeEvent;
exports.findOnGoingPandingEvent = findOnGoingPandingEvent;
exports.findOnGoingUseStrikeEventSkill = findOnGoingUseStrikeEventSkill;
exports.findOnGoingPandingEventSkill = findOnGoingPandingEventSkill;
exports.setEventSkillResponse = setEventSkillResponse;