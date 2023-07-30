const {throwCards} = require("../../utils/cardUtils");
const {findOnGoingUseStrikeEventSkill} = require("../../event/utils");
const {findOnGoingUseStrikeEvent} = require("../../event/utils");

const handleWu006LiuLiResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];

    const onGoingUseStrikeEvent = findOnGoingUseStrikeEvent(gameStatus);
    const onGoingUseStrikeEventSkill = findOnGoingUseStrikeEventSkill(gameStatus);

    if (!chooseToReleaseSkill) {
        onGoingUseStrikeEventSkill.done = true;
        return
    }

    if (onGoingUseStrikeEventSkill.chooseToReleaseSkill === undefined) {
        onGoingUseStrikeEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
    } else {
        originPlayer.removeCards(response.cards);
        throwCards(gameStatus, response.cards);

        onGoingUseStrikeEvent.targetId = response.skillTargetIds[0];

        onGoingUseStrikeEventSkill.releaseTargetIds = response.skillTargetIds
        onGoingUseStrikeEventSkill.releaseCards = response.cards // 最后结算弃牌的时候需要
        onGoingUseStrikeEventSkill.done = true;

        delete gameStatus.skillResponse
    }
}


exports.handleWu006LiuLiResponse = handleWu006LiuLiResponse;
