const {USE_EVENT_TIMING} = require("../config/eventConfig");
const {USE_OR_PLAY_CONFIG} = require("../config/eventConfig");
const {generateResponseCardEventThenSetNextResponseCardEventSkill} = require("./responseCardEvent");
const {findOnGoingEvent} = require("./utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../config/eventConfig");
const {generateDamageEventThenSetNextDamageEventSkill} = require("./damageEvent");
const {findNextUnDoneSkillInLastEventTimingsWithSkills} = require("./utils");
const {setEventSkillResponse} = require("./utils");
const {findAllEventSkillsByTimingNameAndActionCard} = require("./utils");
const {EQUIPMENT_CARDS_CONFIG} = require("../config/cardConfig");
const {CARD_COLOR} = require("../config/cardConfig");
const {getActualCardColor} = require("../utils/cardUtils");
const {last} = require("lodash");
const {getCurrentPlayer, getAllAlivePlayersStartFromFirstLocation} = require("../utils/playerUtils");

const generateUseStrikeEventsThenSetNextStrikeEventSkill = (gameStatus, {originId, targetIds, cards, actualCard}) => {
    const targetPlayers = getAllAlivePlayersStartFromFirstLocation(gameStatus, getCurrentPlayer(gameStatus).location)
        .filter(p => targetIds.includes(p.playerId))
    const originPlayer = gameStatus.players[originId];

    if (gameStatus.stage.playerId == originPlayer.playerId) {
        originPlayer.shaTimes++;
    }

    gameStatus.useStrikeEvents = targetPlayers.map((targetPlayer) => {
        return {
            cards,
            actualCard,
            originId,
            targetId: targetPlayer.playerId,
            cantShan: false,
            eventTimingsWithSkills: [],
            done: false
        }
    })

    setNextStrikeEventSkill(gameStatus);
}

const setNextStrikeEventSkill = (gameStatus) => {
    const useStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS)

    if (!useStrikeEvent) {
        return
    }

    const {eventTimingsWithSkills, originId, targetId, actualCard} = useStrikeEvent;
    const originPlayer = gameStatus.players[originId];
    const targetPlayer = gameStatus.players[targetId];
    const actionCardKey = actualCard?.key;

    if (eventTimingsWithSkills.length == 0) {
        const eventTimingName = USE_EVENT_TIMING.WHEN_BECOMING_TARGET // 【流离】
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, actionCardKey, originId, targetId})
        eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == USE_EVENT_TIMING.WHEN_BECOMING_TARGET) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            const eventTimingName = USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET // 【铁骑】【烈弓】【青釭剑】【雌雄双股剑】
            const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, actionCardKey, originId, targetId})
            eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                setEventSkillResponse(gameStatus, eventTimingSkills[0])
                return;
            }
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            const eventTimingName = USE_EVENT_TIMING.WHEN_SETTLEMENT_BEGINS // 【仁王盾】【藤甲①】
            // 杀会取消的情况 无QIN_GANG_JIAN&&黑杀&&仁王盾
            if (getActualCardColor(actualCard) == CARD_COLOR.BLACK &&
                targetPlayer.shieldCard?.key == EQUIPMENT_CARDS_CONFIG.REN_WANG_DUN.key &&
                originPlayer.weaponCard?.key != EQUIPMENT_CARDS_CONFIG.QIN_GANG_JIAN.key) {
                useStrikeEvent.done = true;
                handleUseStrikeEventEnd(gameStatus);
            } else {
                if (useStrikeEvent.cantShan) {
                    useStrikeEvent.done = true;
                    generateDamageEventThenSetNextDamageEventSkill(gameStatus, {
                        damageCards: useStrikeEvent.cards,
                        damageActualCard: useStrikeEvent.actualCard, // 渠道
                        damageAttribute: useStrikeEvent.actualCard?.attribute,// 属性
                        originId: useStrikeEvent.originId,// 来源
                        targetId: useStrikeEvent.targetId,
                    })
                    handleUseStrikeEventEnd(gameStatus);
                } else {
                    eventTimingsWithSkills.push({eventTimingName, eventTimingSkills: []})
                    generateResponseCardEventThenSetNextResponseCardEventSkill(gameStatus, {
                        originId: useStrikeEvent.targetId,
                        targetId: useStrikeEvent.originId,
                        actionCards: useStrikeEvent.cards,
                        actionActualCard: useStrikeEvent.actualCard,
                        useOrPlay: USE_OR_PLAY_CONFIG.USE
                    })
                }
            }
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == USE_EVENT_TIMING.WHEN_SETTLEMENT_BEGINS) {
        if (useStrikeEvent.dodgeStatus === undefined) { // 没有决定是否响应 等待前端响应
            return;
        } else if (useStrikeEvent.dodgeStatus === true) {  // 使用以后 【贯石斧】
            const eventTimingName = USE_EVENT_TIMING.BEFORE_TAKE_EFFECT // 【贯石斧】、【青龙偃月刀】
            const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {
                eventTimingName,
                actionCardKey,
                originId,
                targetId
            })
            eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                setEventSkillResponse(gameStatus, eventTimingSkills[0])
                return;
            }
        } else if (useStrikeEvent.dodgeStatus === false) {
            // handle card res的时候已经把useStrikeEvents删除了
            console.log('Should not into useStrikeEvent.dodgeStatus === false')
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == USE_EVENT_TIMING.BEFORE_TAKE_EFFECT) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            setStatusWhenUseStrikeEventDone(gameStatus);
            handleUseStrikeEventEnd(gameStatus);
        }
    }
}

const setStatusWhenUseStrikeEventDone = (gameStatus) => {
    const useStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
    useStrikeEvent.done = true;
}

const handleUseStrikeEventEnd = (gameStatus) => {
    if (gameStatus.useStrikeEvents.every((e) => e.done)) {
        delete gameStatus.useStrikeEvents;
    } else {
        setNextStrikeEventSkill(gameStatus)
    }
}

exports.generateUseStrikeEventsThenSetNextStrikeEventSkill = generateUseStrikeEventsThenSetNextStrikeEventSkill;
exports.setNextStrikeEventSkill = setNextStrikeEventSkill;