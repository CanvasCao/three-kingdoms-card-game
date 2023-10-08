const {generatePandingEventThenSetNextPandingEventSkill} = require("../../event/pandingEvent");
const {findOnGoingEventSkill} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");

const handleWei007LuoShenResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];

    const onGoingGameStageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.GAME_STAGE_EVENT);

    if (!chooseToReleaseSkill) {
        onGoingGameStageEventSkill.done = true;
        return
    }

    if (onGoingGameStageEventSkill.chooseToReleaseSkill === undefined) {
        onGoingGameStageEventSkill.chooseToReleaseSkill = chooseToReleaseSkill

        onGoingGameStageEventSkill.done = true;
        generatePandingEventThenSetNextPandingEventSkill(gameStatus, {
            originId: originPlayer.playerId,
            pandingNameKey: onGoingGameStageEventSkill.skillKey
        })
    } else {
        onGoingGameStageEventSkill.done = true;
    }
    delete gameStatus.skillResponse
}


exports.handleWei007LuoShenResponse = handleWei007LuoShenResponse;
