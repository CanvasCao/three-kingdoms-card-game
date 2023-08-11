const {ALL_SHA_CARD_KEYS} = require("../config/cardConfig");
const {PLAY_EVENT_TIMING} = require("../config/eventConfig");
const {ALL_EVENTS_KEY_CONFIG} = require("../config/eventConfig");
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

const configTimingSkillToResponseSkill = (configSkill, playerId) => {
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


const findOnGoingEvent = (gameStatus, eventKey) => {
    if ([ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS, ALL_EVENTS_KEY_CONFIG.RESPONSE_CARD_EVENTS].includes(eventKey)) {
        return gameStatus?.[eventKey].find((event) => !event.done)
    }
    return gameStatus?.[eventKey]
}

const findOnGoingEventSkill = (gameStatus, eventKey) => {
    const event = findOnGoingEvent(gameStatus, eventKey)
    const eventTiming = event?.eventTimingsWithSkills
        .find((et) => et.eventTimingSkills
            .some((s) => s.done === false))

    return eventTiming?.eventTimingSkills.find((s) => s.done === false)
}

// AllEventSkills
const findAllEventSkillsByTimingNameAndActionCard = (gameStatus, {eventTimingName, actionCardKey, originId, targetId}) => {
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
                .map((skill) => configTimingSkillToResponseSkill(skill, player.playerId))
            eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
        })
    } else if (eventTimingName == PANDING_EVENT_TIMING.AFTER_PANDING_TAKE_EFFECT) {
        const eventSkillsForPlayer = originPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
            .filter((skill) => skill && skill.triggerTiming == eventTimingName)
            .map((skill) => configTimingSkillToResponseSkill(skill, originPlayer.playerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
    }

    // 杀 相关技能
    else if (eventTimingName == USE_EVENT_TIMING.WHEN_BECOMING_TARGET && ALL_SHA_CARD_KEYS.includes(actionCardKey)) {
        const eventSkillsForPlayer = targetPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
            .filter((skill) => skill && skill.triggerTiming == eventTimingName)
            .map((skill) => configTimingSkillToResponseSkill(skill, targetPlayerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
    } else if (eventTimingName == USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET && ALL_SHA_CARD_KEYS.includes(actionCardKey)) {
        const eventSkillsForPlayer = originPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
            .filter((skill) => skill && skill.triggerTiming == eventTimingName)
            .map((skill) => configTimingSkillToResponseSkill(skill, originPlayerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)

        // 雌雄双股剑
        if (originPlayer.weaponCard &&
            originPlayer.weaponCard.key === CARD_CONFIG.CI_XIONG_SHUANG_GU_JIAN.key &&
            originPlayer.gender !== targetPlayer.gender) {
            const skill = configTimingSkillToResponseSkill(
                {key: EQUIPMENT_CARDS_CONFIG.CI_XIONG_SHUANG_GU_JIAN.key},
                originPlayer.playerId)
            eventTimingSkills = eventTimingSkills.concat(skill)
        }
    } else if (eventTimingName == USE_EVENT_TIMING.BEFORE_TAKE_EFFECT && ALL_SHA_CARD_KEYS.includes(actionCardKey)) {
        // 贯石斧
        if (originPlayer.weaponCard &&
            originPlayer.weaponCard.key === CARD_CONFIG.GUAN_SHI_FU.key) {
            const skill = configTimingSkillToResponseSkill(
                {key: EQUIPMENT_CARDS_CONFIG.GUAN_SHI_FU.key},
                originPlayer.playerId)
            eventTimingSkills = eventTimingSkills.concat(skill)
        }
    }

    // 伤害
    else if (eventTimingName == DAMAGE_EVENT_TIMING.WHEN_CAUSE_DAMAGE &&
        [...ALL_SHA_CARD_KEYS].includes(actionCardKey)
    ) {
        // 寒冰箭

        // 麒麟弓
        if (originPlayer.weaponCard &&
            originPlayer.weaponCard.key === CARD_CONFIG.QI_LIN_GONG.key &&
            (targetPlayer.plusHorseCard || targetPlayer.minusHorseCard)
        ) {
            const skill = configTimingSkillToResponseSkill(
                {key: EQUIPMENT_CARDS_CONFIG.QI_LIN_GONG.key},
                originPlayer.playerId)
            eventTimingSkills = eventTimingSkills.concat(skill)
        }
    } else if (eventTimingName == DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE) {
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
            .map((skill) => configTimingSkillToResponseSkill(skill, targetPlayerId))
        eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
    }

    // 使用牌
    else if (eventTimingName == PLAY_EVENT_TIMING.WHEN_NEED_PLAY &&
        [CARD_CONFIG.WAN_JIAN_QI_FA.key, ...ALL_SHA_CARD_KEYS].includes(actionCardKey)) {
        // 八卦
        if (originPlayer?.shieldCard?.key == CARD_CONFIG.BA_GUA_ZHEN.key &&
            targetPlayer?.weaponCard?.key !== CARD_CONFIG.QIN_GANG_JIAN.key
        ) {
            const skill = configTimingSkillToResponseSkill(
                {key: EQUIPMENT_CARDS_CONFIG.BA_GUA_ZHEN.key},
                originPlayer.playerId)
            eventTimingSkills = eventTimingSkills.concat(skill)
        }
    }

    return eventTimingSkills;
}


exports.configTimingSkillToResponseSkill = configTimingSkillToResponseSkill;
exports.findAllEventSkillsByTimingNameAndActionCard = findAllEventSkillsByTimingNameAndActionCard;

exports.findOnGoingEvent = findOnGoingEvent;
exports.findOnGoingEventSkill = findOnGoingEventSkill;

exports.setEventSkillResponse = setEventSkillResponse;
exports.findNextUnDoneSkillInLastEventTimingsWithSkills = findNextUnDoneSkillInLastEventTimingsWithSkills;