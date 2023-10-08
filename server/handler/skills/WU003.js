const {STAGE_NAME} = require("../../config/gameAndStageConfig");
const {findOnGoingEventSkill} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");
const {getCurrentPlayer} = require("../../utils/playerUtils");

const handleWu003KeJiResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const onGoingGameStageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.GAME_STAGE_EVENT);

    onGoingGameStageEventSkill.done = true;
    if (chooseToReleaseSkill) {
        getCurrentPlayer(gameStatus).skipStage[STAGE_NAME.THROW] = true;
    } else {

    }
    delete gameStatus.skillResponse
}


exports.handleWu003KeJiResponse = handleWu003KeJiResponse;
