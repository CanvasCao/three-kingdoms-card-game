const {GAME_STAGE_TIMING} = require("../config/eventConfig");
const endPlayHandler = {
    handleEndPlay(gameStatus) {
        const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_IS_PLAYING
        gameStatus.gameStageEvent.eventTimingTracker.push({eventTimingName, eventTimingSkills: []})
    }
}

exports.endPlayHandler = endPlayHandler;