const pandingEvent = require("../../event/pandingEvent");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");
const {findOnGoingEventSkill} = require("../../event/utils");
const handleShu006TieJiResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;

    const onGoingUseStrikeEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
    onGoingUseStrikeEventSkill.done = true;

    if (chooseToReleaseSkill) {
        pandingEvent.generatePandingEventThenSetNextPandingEventSkill(gameStatus, {
            originId: onGoingUseStrikeEventSkill.playerId,
            pandingNameKey: onGoingUseStrikeEventSkill.skillNameKey
        });

        delete gameStatus.skillResponse
    }
}

exports.handleShu006TieJiResponse = handleShu006TieJiResponse;
