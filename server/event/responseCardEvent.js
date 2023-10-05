const {findAllUnDoneEvents} = require("./utils");
const {USE_OR_PLAY_CONFIG} = require("../config/eventConfig");
const {CARD_CONFIG} = require("../config/cardConfig");
const {SCROLL_CARDS_CONFIG} = require("../config/cardConfig");
const {ALL_SHA_CARD_KEYS} = require("../config/cardConfig");
const {PLAY_EVENT_TIMINGS} = require("../config/eventConfig");
const {findOnGoingEvent} = require("./utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../config/eventConfig");
const {findNextUnDoneSkillInLastEventTimingsWithSkills} = require("./utils");
const {setEventSkillResponse} = require("./utils");
const {findAllEventSkillsByTimingNameAndActionCard} = require("./utils");
const {last} = require("lodash");

// use 包含了使用闪（响应杀）
// play 打出杀闪（万箭 南蛮 决斗）
// 为了八卦 这里的闪都视为play 打出
const generateResponseCardEventThenSetNextResponseCardEventSkill = (gameStatus, {
    originId,
    targetId,
    actionCards,
    actionActualCard,
    useOrPlay,
}) => {
    let times = 1;
    targetPlayer = gameStatus.players[targetId] // ResponseCardEvent targetPlayer 就是伤害来源
    if (ALL_SHA_CARD_KEYS.includes(actionActualCard.key)) {
        times = targetPlayer.responseStrikeNumber || 1;
    } else if (actionActualCard.key == SCROLL_CARDS_CONFIG.JUE_DOU.key) {
        times = targetPlayer.responseDuelNumber || 1;
    }

    gameStatus.responseCardEvents = new Array(times).fill().map(() => {
        return {
            originId,
            targetId,
            actionCards,
            actionActualCard,
            useOrPlay,
            cardNumber: times,
            responseStatus: undefined,
            eventTimingTracker: [],
            done: false,
        }
    })
    setNextResponseCardEventSkill(gameStatus);
}

const setNextResponseCardEventSkill = (gameStatus) => {
    const responseCardEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.RESPONSE_CARD_EVENTS)
    if (!responseCardEvent) {
        return
    }

    // 吕布 重置cardNumber在前端显示
    const allUnDoneEvents = findAllUnDoneEvents(gameStatus, ALL_EVENTS_KEY_CONFIG.RESPONSE_CARD_EVENTS);
    gameStatus.responseCardEvents.forEach((event) => event.cardNumber = allUnDoneEvents.length)

    const {actionCards, actionActualCard, cardNumber, eventTimingTracker, originId, targetId} = responseCardEvent

    const timingIndex = 0;
    if (eventTimingTracker.length == 0) {
        const eventTimingName = PLAY_EVENT_TIMINGS[timingIndex]

        // 这个阶段只判断八卦
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {
            eventTimingName,
            actionCardKey: actionActualCard?.key,
            originId,
            targetId
        })
        eventTimingTracker.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingTracker).eventTimingName == PLAY_EVENT_TIMINGS[timingIndex]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingTracker)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            const eventTimingName = PLAY_EVENT_TIMINGS[timingIndex + 1]

            if (responseCardEvent.responseStatus === undefined) { // 没有决定是否响应 等待前端响应
                gameStatus.cardResponse = {
                    originId,
                    targetId,
                    cardNumber,
                    actionCards,
                    actionActualCard,
                }
                return;
            } else if (responseCardEvent.responseStatus === true) {  // 使用以后 雷击
                const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {
                    eventTimingName,
                    actionCardKey: actionActualCard?.key,
                    originId,
                    targetId
                })
                eventTimingTracker.push({eventTimingName, eventTimingSkills})

                if (eventTimingSkills.length > 0) {
                    setEventSkillResponse(gameStatus, eventTimingSkills[0])
                    return;
                }
            } else if (responseCardEvent.responseStatus === false) {
                // handle card res的时候已经把responseCardEvents删除了
                console.log('Should not into responseCardEvent.responseStatus === false')
            }
        }
    }

    if (last(eventTimingTracker).eventTimingName == PLAY_EVENT_TIMINGS[timingIndex + 1]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingTracker)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            setStatusWhenResponseCardEventDone(gameStatus);
            handleResponseCardEventEnd(gameStatus);
        }
    }
}

const setStatusWhenResponseCardEventDone = (gameStatus) => {
    const responseCardEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.RESPONSE_CARD_EVENTS);
    responseCardEvent.done = true;
}

const handleResponseCardEventEnd = (gameStatus) => {
    if (gameStatus.responseCardEvents.every((e) => e.done)) {
        const responseCardEvent = gameStatus.responseCardEvents[0]
        const actionCardKey = responseCardEvent.actionActualCard.key
        delete gameStatus.responseCardEvents;

        // 响应决斗 之后出牌 需要互换目标
        if (actionCardKey == CARD_CONFIG.JUE_DOU.key) {
            generateResponseCardEventThenSetNextResponseCardEventSkill(gameStatus, {
                originId: responseCardEvent.targetId,
                targetId: responseCardEvent.originId,
                actionCards: responseCardEvent.actionCards,
                actionActualCard: responseCardEvent.actionActualCard,
            })
        }
    } else {
        setNextResponseCardEventSkill(gameStatus)
    }
}

exports.generateResponseCardEventThenSetNextResponseCardEventSkill = generateResponseCardEventThenSetNextResponseCardEventSkill;
exports.setNextResponseCardEventSkill = setNextResponseCardEventSkill;