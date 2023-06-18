const {setEventSkillResponse} = require("./utils");
const {CARD_COLOR} = require("../config/cardConfig");
const {getActualCardColor} = require("../utils/cardUtils");
const {findOnGoingUseStrikeEvent} = require("./utils");
const {emitNotifyPandingPlayPublicCard} = require("../utils/emitUtils");
const {throwCards} = require("../utils/cardUtils");
const {getCards} = require("../utils/cardUtils");
const {findAllEventSkillsByTimingName} = require("./utils");
const {PANDING_EVENT_TIMING} = require("../config/eventConfig");
const {last} = require("lodash");

const generatePandingEventThenSetNextPandingEventSkillToSkillResponse = (gameStatus, originId, pandingContent) => {
    const pandingResultCard = getCards(gameStatus, 1)
    gameStatus.pandingEvent = {
        originId,
        eventTimingsWithSkills: [],
        done: false,
        pandingContent,
        pandingResultCard,
    }

    emitNotifyPandingPlayPublicCard(gameStatus, pandingResultCard, gameStatus.players[originId], pandingContent);
    setNextPandingEventSkillToSkillResponse(gameStatus);
}

const setNextPandingEventSkillToSkillResponse = (gameStatus) => {
    const pandingEvent = gameStatus.pandingEvent;
    if (!pandingEvent) {
        return;
    }

    const originId = pandingEvent.originId;
    const eventTimingsWithSkills = pandingEvent.eventTimingsWithSkills

    if (eventTimingsWithSkills.length == 0) {
        const eventTimingName = PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT
        const eventTimingSkills = findAllEventSkillsByTimingName(gameStatus, {eventTimingName, originId})
        pandingEvent.eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            gameStatus.skillResponse = eventTimingSkills[0]
            return;
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT) {
        const unChooseToReleaseSkill = last(eventTimingsWithSkills).eventTimingSkills
            .find((eventTimingSkill) => !eventTimingSkill.done)

        if (unChooseToReleaseSkill) {
            setEventSkillResponse(gameStatus, unChooseToReleaseSkill)
            return;
        } else {
            const eventTimingName = PANDING_EVENT_TIMING.AFTER_PANDING_TAKE_EFFECT
            const eventTimingSkills = findAllEventSkillsByTimingName(gameStatus, {eventTimingName, originId})
            pandingEvent.eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                gameStatus.skillResponse = eventTimingSkills[0]
                return;
            } else { // 判定结束
                handlePandingEventEnd(gameStatus)
                return;
            }
        }
    }
}

const handlePandingEventEnd = (gameStatus) => {
    const pandingEvent = gameStatus.pandingEvent;

    if (pandingEvent.pandingContent == '铁骑') {
        const useStrikeEvent = findOnGoingUseStrikeEvent(gameStatus);
        if (getActualCardColor(pandingEvent.pandingResultCard) == CARD_COLOR.RED) {
            useStrikeEvent.cantShan = true;
        }
    }

    pandingEvent.done = true;
    throwCards(gameStatus, pandingEvent.pandingResultCard);
    delete gameStatus.pandingEvent;
}

exports.generatePandingEventThenSetNextPandingEventSkillToSkillResponse = generatePandingEventThenSetNextPandingEventSkillToSkillResponse;
exports.setNextPandingEventSkillToSkillResponse = setNextPandingEventSkillToSkillResponse;