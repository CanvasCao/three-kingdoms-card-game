const {emitNotifyPandingPlayPublicCard} = require("../utils/emitUtils");
const {throwCards} = require("../utils/cardUtils");
const {getCards} = require("../utils/cardUtils");
const {findAllEventSkillsByTimingName} = require("./utils");
const {PANDING_EVENT_TIMING} = require("../config/eventConfig");
const {last} = require("lodash");

const generatePandingEvent = (gameStatus, originId, skillName) => {
    gameStatus.pandingEvent = {
        originId,
        timings: [],
        done: false
    }

    const pandingResultCard = getCards(gameStatus, 1);
    throwCards(gameStatus, pandingResultCard);
    emitNotifyPandingPlayPublicCard(gameStatus, pandingResultCard, gameStatus.players[originId], skillName);

    findNextSkillToReleaseInPandingEvent(gameStatus, originId, skillName);
}

const findNextSkillToReleaseInPandingEvent = (gameStatus, originId) => {
    const pandingEvent = gameStatus.pandingEvent;
    const pandingEventTimings = pandingEvent.timings

    if (pandingEventTimings.length == 0) {
        const name = PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT
        const eventSkills = findAllEventSkillsByTimingName(gameStatus, {name, originId})
        pandingEvent.timings.push({name, skills: eventSkills})

        if (eventSkills.length > 0) {
            gameStatus.skillResponse= eventSkills[0]
            return;
        }
    }

    if (last(pandingEventTimings).name == PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT) {
        const name = PANDING_EVENT_TIMING.AFTER_PANDING_TAKE_EFFECT
        const eventSkills = findAllEventSkillsByTimingName(gameStatus, {name, originId})
        pandingEvent.timings.push({name, skills: eventSkills})

        if (eventSkills.length > 0) {
            gameStatus.skillResponse = eventSkills[0]
            return;
        } else { // 判定结束
            pandingEvent.done = true;
        }
    }
}

exports.generatePandingEvent = generatePandingEvent;