const {PLAY_EVENT_TIMINGS} = require("../config/eventConfig");
const {findOnGoingEvent} = require("./utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../config/eventConfig");
const {findNextUnDoneSkillInLastEventTimingsWithSkills} = require("./utils");
const {setEventSkillResponse} = require("./utils");
const {findAllEventSkillsByTimingName} = require("./utils");
const {last} = require("lodash");

// hardcode shan
const generatePlayEventThenSetNextPlayEventSkillToSkillResponse = (gameStatus, {originId, targetId, cardNumber = 1}) => {
    gameStatus.playEvents = new Array(cardNumber).fill().map(() => {
        return {
            playStatus: undefined,
            cardNumber,
            originId,
            targetId,
            eventTimingsWithSkills: [],
            done: false,
        }
    })
    setNextPlayEventSkillToSkillResponse(gameStatus);
}

const setNextPlayEventSkillToSkillResponse = (gameStatus) => {
    const playEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.PLAY_EVENTS)

    if (!playEvent) {
        return
    }

    const eventTimingsWithSkills = playEvent.eventTimingsWithSkills;
    const originId = playEvent.originId
    const targetId = playEvent.targetId;

    let timingIndex = 0;
    if (eventTimingsWithSkills.length == 0) {
        const eventTimingName = PLAY_EVENT_TIMINGS[timingIndex]
        const eventTimingSkills = findAllEventSkillsByTimingName(gameStatus, {eventTimingName, originId, targetId})
        eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    // 使用以后
    if (last(eventTimingsWithSkills).eventTimingName == PLAY_EVENT_TIMINGS[timingIndex]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            const eventTimingName = PLAY_EVENT_TIMINGS[timingIndex + 1]
            if (playEvent.playStatus === true) {
                const eventTimingSkills = findAllEventSkillsByTimingName(gameStatus, {eventTimingName, originId, targetId})
                eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

                if (eventTimingSkills.length > 0) {
                    setEventSkillResponse(gameStatus, eventTimingSkills[0])
                    return;
                }
            } else if (playEvent.playStatus === false) {
                eventTimingsWithSkills.push({eventTimingName, eventTimingSkills: []})
            } else if (playEvent.playStatus === undefined) {
                // 等待前端响应
                gameStatus.shanResponse = {
                    originId: playEvent.originId,
                    targetId: playEvent.targetId,
                    cardNumber: playEvent.cardNumber
                }
                return;
            }
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == PLAY_EVENT_TIMINGS[timingIndex + 1]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            setStatusWhenPlayEventDone(gameStatus);
            handlePlayEventEnd(gameStatus);
        }
    }
}

const setStatusWhenPlayEventDone = (gameStatus) => {
    const playEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.PLAY_EVENTS);
    playEvent.done = true;
}

const handlePlayEventEnd = (gameStatus) => {
    if (gameStatus.playEvents.every((e) => e.done)) {
        delete gameStatus.playEvents;
    } else {
        setNextPlayEventSkillToSkillResponse(gameStatus)
    }
}

exports.generatePlayEventThenSetNextPlayEventSkillToSkillResponse = generatePlayEventThenSetNextPlayEventSkillToSkillResponse;
exports.setNextPlayEventSkillToSkillResponse = setNextPlayEventSkillToSkillResponse;