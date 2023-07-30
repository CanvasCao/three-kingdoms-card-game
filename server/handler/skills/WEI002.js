const {throwCards} = require("../../utils/cardUtils");
const {findOnGoingPandingEvent} = require("../../event/utils");
const {findOnGoingPandingEventSkill} = require("../../event/utils");
const {findOnGoingDamageEventSkill} = require("../../event/utils");

const handleWei002FanKuiResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const onGoingDamageEventSkill = findOnGoingDamageEventSkill(gameStatus);

    if (!chooseToReleaseSkill) {
        onGoingDamageEventSkill.done = true;
        return
    }

    if (onGoingDamageEventSkill.chooseToReleaseSkill === undefined) {
        onGoingDamageEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
    } else {
        // 在CardBoard
        // onGoingDamageEventSkill.done = true;
        // 不能删除 gameStatus.skillResponse
    }
}

const handleWei002GuiCaiResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];

    const onGoingPandingEventSkill = findOnGoingPandingEventSkill(gameStatus);
    const onGoingPandingEvent = findOnGoingPandingEvent(gameStatus)

    if (!chooseToReleaseSkill) {
        onGoingPandingEventSkill.done = true;
        return
    }

    // 发动
    if (onGoingPandingEventSkill.chooseToReleaseSkill === undefined) {
        onGoingPandingEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
    } else { // 发动+改判
        originPlayer.removeCards(response.cards);
        throwCards(gameStatus, onGoingPandingEvent.pandingResultCard);

        onGoingPandingEvent.pandingResultCard = response.cards[0]
        onGoingPandingEventSkill.releaseCards = response.cards
        onGoingPandingEventSkill.done = true;
        delete gameStatus.skillResponse
    }
}

exports.handleWei002FanKuiResponse = handleWei002FanKuiResponse;
exports.handleWei002GuiCaiResponse = handleWei002GuiCaiResponse;