const pandingEvent = require("../../event/pandingEvent");
const {findOnGoingUseStrikeEventSkill} = require("../../event/utils");
const handleShu006TieJiResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;

    const onGoingUseStrikeEventSkill = findOnGoingUseStrikeEventSkill(gameStatus);
    onGoingUseStrikeEventSkill.done = true;

    if (chooseToReleaseSkill) {
        pandingEvent.generatePandingEventThenSetNextPandingEventSkillToSkillResponse(gameStatus, {
            originId: onGoingUseStrikeEventSkill.playerId,
            pandingNameKey: onGoingUseStrikeEventSkill.skillNameKey
        });

        delete gameStatus.skillResponse
    }
}

exports.handleShu006TieJiResponse = handleShu006TieJiResponse;
