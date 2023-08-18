const {CARD_CONFIG} = require("../config/cardConfig");
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
    cardNumber = 1,
    actionCards,
    actionActualCard,
    responseCardKeys,
    useOrPlay,
}) => {
    gameStatus.responseCardEvents = new Array(cardNumber).fill().map(() => {
        return {
            originId,
            targetId,
            cardNumber,
            actionCards,
            actionActualCard,
            responseCardKeys,
            useOrPlay,
            responseStatus: undefined,
            eventTimingsWithSkills: [],
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

    const {useOrPlay, actionCards, actionActualCard, responseCardKeys, eventTimingsWithSkills, originId, targetId, cardNumber} = responseCardEvent

    const timingIndex = 0;
    if (eventTimingsWithSkills.length == 0) {
        const eventTimingName = PLAY_EVENT_TIMINGS[timingIndex]

        // 这个阶段只判断八卦
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {
            eventTimingName,
            actionCardKey: actionActualCard?.key,
            originId,
            targetId
        })
        eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == PLAY_EVENT_TIMINGS[timingIndex]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
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
                    responseCardKeys,
                }
                return;
            } else if (responseCardEvent.responseStatus === true) {  // 使用以后 雷击
                const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {
                    eventTimingName,
                    actionCardKey: actionActualCard?.key,
                    originId,
                    targetId
                })
                eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

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

    if (last(eventTimingsWithSkills).eventTimingName == PLAY_EVENT_TIMINGS[timingIndex + 1]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
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
        delete gameStatus.responseCardEvents;
    } else {
        setNextResponseCardEventSkill(gameStatus)
    }
}

exports.generateResponseCardEventThenSetNextResponseCardEventSkill = generateResponseCardEventThenSetNextResponseCardEventSkill;
exports.setNextResponseCardEventSkill = setNextResponseCardEventSkill;