const {GAME_STAGE_TIMING} = require("../config/eventConfig");
const {getCurrentPlayer} = require("../utils/playerUtils");
const {throwCards} = require("../utils/cardUtils")
const throwHandler = {
    handleThrowCards(gameStatus, data) {
        const cards = data.cards;
        getCurrentPlayer(gameStatus).removeCards(cards);
        throwCards(gameStatus, cards);

        const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_IS_THROWING
        gameStatus.gameStageEvent.eventTimingTracker.push({eventTimingName, eventTimingSkills: []})
    }
}

exports.throwHandler = throwHandler;