const {intersectionBy} = require("lodash/array");
const {GAME_STAGE_TIMING} = require("../config/eventConfig");
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
//         "eventTimingTracker": [
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
const findNextUnDoneSkillInLastEventTimingsWithSkills = (gameStatus, eventTimingTracker) => {
    const eventTimingSkills = last(eventTimingTracker).eventTimingSkills

    // 找到没有放而且释放角色还没有阵亡的技能
    return eventTimingSkills.find((eventTimingSkill) => {
        const needReleaseSkillPlayer = gameStatus.players[eventTimingSkill.playerId];
        return !eventTimingSkill.done && !needReleaseSkillPlayer.isDead
    })
}

const findAllUnDoneEvents = (gameStatus, eventKey) => {
    if (eventKey.endsWith("s")) { // 复数结尾
        return gameStatus?.[eventKey]?.filter((event) => !event.done)
    }
    return gameStatus?.[eventKey]
}

const findOnGoingEvent = (gameStatus, eventKey) => {
    if (eventKey.endsWith("s")) { // 复数结尾
        return gameStatus?.[eventKey]?.find((event) => !event.done)
    }
    return gameStatus?.[eventKey]
}

const findOnGoingEventSkill = (gameStatus, eventKey) => {
    const event = findOnGoingEvent(gameStatus, eventKey)
    const eventTiming = event?.eventTimingTracker
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
    let eventSkillsForPlayer = [];

    switch (eventTimingName) {
        // 判定 相关技能
        case PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT:
            const allPlayers = getAllAlivePlayersStartFromFirstLocation(gameStatus, gameStatus.players[originId].location)
            allPlayers.forEach((player) => {
                const eventSkillsForPlayer = player.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
                    .filter((skill) => skill && skill.triggerTiming == eventTimingName)
                    .map((skill) => configTimingSkillToResponseSkill(skill, player.playerId))
                eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
            })
            break;
        case PANDING_EVENT_TIMING.AFTER_PANDING_TAKE_EFFECT:
            eventSkillsForPlayer = originPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
                .filter((skill) => skill && skill.triggerTiming == eventTimingName)
                .map((skill) => configTimingSkillToResponseSkill(skill, originPlayer.playerId))
            eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
            break;

        // 杀 相关技能
        case USE_EVENT_TIMING.WHEN_BECOMING_TARGET:
            if (ALL_SHA_CARD_KEYS.includes(actionCardKey)) {
                const eventSkillsForPlayer = targetPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
                    .filter((skill) => skill && skill.triggerTiming == eventTimingName)
                    .map((skill) => configTimingSkillToResponseSkill(skill, targetPlayerId))
                eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
            }
            break;
        case USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET:
            if (ALL_SHA_CARD_KEYS.includes(actionCardKey)) {
                const eventSkillsForPlayer = originPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
                    .filter((skill) => skill && skill.triggerTiming == eventTimingName)
                    .map((skill) => configTimingSkillToResponseSkill(skill, originPlayerId))
                eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)

                // 雌雄双股剑
                if (originPlayer.weaponCard &&
                    originPlayer.weaponCard.key === CARD_CONFIG.CI_XIONG_SHUANG_GU_JIAN.key &&
                    originPlayer.gender !== targetPlayer.gender) {
                    const skill = configTimingSkillToResponseSkill(
                        {key: EQUIPMENT_CARDS_CONFIG.CI_XIONG_SHUANG_GU_JIAN.key}, originPlayer.playerId)
                    eventTimingSkills = eventTimingSkills.concat(skill)
                }
            }
            break;
        case USE_EVENT_TIMING.BEFORE_TAKE_EFFECT:
            if (ALL_SHA_CARD_KEYS.includes(actionCardKey)) {
                // 贯石斧
                if (originPlayer.weaponCard &&
                    originPlayer.weaponCard.key === CARD_CONFIG.GUAN_SHI_FU.key) {
                    const skill = configTimingSkillToResponseSkill(
                        {key: EQUIPMENT_CARDS_CONFIG.GUAN_SHI_FU.key}, originPlayer.playerId)
                    eventTimingSkills = eventTimingSkills.concat(skill)
                }

                // 青龙偃月刀
                if (originPlayer.weaponCard &&
                    originPlayer.weaponCard.key === CARD_CONFIG.QING_LONG_YAN_YUE_DAO.key) {
                    const skill = configTimingSkillToResponseSkill(
                        {key: EQUIPMENT_CARDS_CONFIG.QING_LONG_YAN_YUE_DAO.key}, originPlayer.playerId)

                    // 前端直接显示是否发动青龙偃月刀 对xx继续出杀？
                    // 而不是 是否发动青龙偃月刀
                    skill.chooseToReleaseSkill = true;
                    eventTimingSkills = eventTimingSkills.concat(skill)
                }
            }
            break;

        // 伤害
        case DAMAGE_EVENT_TIMING.WHEN_CAUSE_DAMAGE:
            if (ALL_SHA_CARD_KEYS.includes(actionCardKey)) {
                // 寒冰箭
                if (originPlayer.weaponCard && originPlayer.weaponCard.key === CARD_CONFIG.HAN_BIN_JIAN.key &&
                    (targetPlayer.hasAnyCards())
                ) {
                    const skill = configTimingSkillToResponseSkill(
                        {key: EQUIPMENT_CARDS_CONFIG.HAN_BIN_JIAN.key},
                        originPlayer.playerId)
                    eventTimingSkills = eventTimingSkills.concat(skill)
                }

                // 麒麟弓
                if (originPlayer.weaponCard && originPlayer.weaponCard.key === CARD_CONFIG.QI_LIN_GONG.key &&
                    (targetPlayer.plusHorseCard || targetPlayer.minusHorseCard)
                ) {
                    const skill = configTimingSkillToResponseSkill(
                        {key: EQUIPMENT_CARDS_CONFIG.QI_LIN_GONG.key},
                        originPlayer.playerId)
                    eventTimingSkills = eventTimingSkills.concat(skill)
                }
            }
            break;
        case DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE:
            eventSkillsForPlayer = targetPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
                .filter((skill) => skill && skill.triggerTiming == eventTimingName)
                .filter((skill) => {
                    return skill.needOrigin ? !!originId : true // 如果技能需要来源
                })
                .filter((skill) => {
                    return skill.needOriginHasCards ? originPlayer.hasAnyCards() : true  // 如果需要技能来源有卡牌技能需要来源
                })
                .filter((skill) => {
                    if (skill.needDamageCards) { // 如果伤害是由卡造成的
                        const onGoingDamageEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);
                        return !!intersectionBy(onGoingDamageEvent.damageCards, gameStatus.throwedCards, 'cardId').length
                    }
                    return true
                })
                .map((skill) => configTimingSkillToResponseSkill(skill, targetPlayerId))
            eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
            break;

        // 使用牌
        case PLAY_EVENT_TIMING.WHEN_NEED_PLAY:
            if ([CARD_CONFIG.WAN_JIAN_QI_FA.key, ...ALL_SHA_CARD_KEYS].includes(actionCardKey)) {
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
            break;

        // game stage
        case GAME_STAGE_TIMING.GAME_STAGE_WHEN_DRAW_START:
            eventSkillsForPlayer = originPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
                .filter((skill) => skill && skill.triggerTiming == eventTimingName)
                .map((skill) => configTimingSkillToResponseSkill(skill, originPlayerId))
            eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
            break;
        case GAME_STAGE_TIMING.GAME_STAGE_IS_DRAWING:
            eventSkillsForPlayer = originPlayer.skills.map((skill) => TIMING_SKILLS_CONFIG[skill.key])
                .filter((skill) => skill && skill.triggerTiming == eventTimingName)
                .map((skill) => configTimingSkillToResponseSkill(skill, originPlayerId))
            eventTimingSkills = eventTimingSkills.concat(eventSkillsForPlayer)
            break;
    }

    return eventTimingSkills;
}

exports.configTimingSkillToResponseSkill = configTimingSkillToResponseSkill;
exports.setEventSkillResponse = setEventSkillResponse;

exports.findNextUnDoneSkillInLastEventTimingsWithSkills = findNextUnDoneSkillInLastEventTimingsWithSkills;

exports.findAllUnDoneEvents = findAllUnDoneEvents;
exports.findOnGoingEvent = findOnGoingEvent;
exports.findOnGoingEventSkill = findOnGoingEventSkill;

exports.findAllEventSkillsByTimingNameAndActionCard = findAllEventSkillsByTimingNameAndActionCard;