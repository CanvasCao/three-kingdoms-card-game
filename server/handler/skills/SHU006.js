const pandingEvent = require("../../event/pandingEvent");
const {findOnGoingUseStrikeEventSkill} = require("../../event/utils");
const handleShu006TieJiResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;

    const onGoingUseStrikeEventSkill = findOnGoingUseStrikeEventSkill(gameStatus);
    onGoingUseStrikeEventSkill.done = true;

    if (chooseToReleaseSkill) {
        const skillNameKey = gameStatus.skillResponse?.skillNameKey;
        const skillResponse = gameStatus.skillResponse;

        pandingEvent.generatePandingEventThenSetNextPandingEventSkillToSkillResponse(gameStatus, {
            originId: skillResponse.playerId,
            pandingNameKey: skillNameKey
        });

        delete gameStatus.skillResponse
    }
}

exports.handleShu006TieJiResponse = handleShu006TieJiResponse;
