const {GAME_STAGE_TIMING} = require("../config/eventConfig");
const {getCurrentPlayer} = require("../utils/playerUtils");
const {ACTION} = require("../action/action")

const throwHandler = {
    handleThrowCards(gameStatus, data) {
        const cards = data.cards;
        ACTION.throw(gameStatus,  getCurrentPlayer(gameStatus),cards)

        const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_IS_THROWING
        gameStatus.gameStageEvent.eventTimingTracker.push({eventTimingName, eventTimingSkills: []})
    }
}

exports.throwHandler = throwHandler;