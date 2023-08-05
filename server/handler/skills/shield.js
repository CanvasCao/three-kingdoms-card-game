const {CARD_CONFIG} = require("../../config/cardConfig");
const {generatePandingEventThenSetNextPandingEventSkill} = require("../../event/pandingEvent");
const {setNextResponseCardEventSkill} = require("../../event/responseCardEvent");
const {findOnGoingEventSkill} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");

const handleBaGuaZhenResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];

    const onGoingPlayEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.RESPONSE_CARD_EVENTS);
    onGoingPlayEventSkill.done = true;

    if (!chooseToReleaseSkill) {
        setNextResponseCardEventSkill(gameStatus)
        return
    }

    delete gameStatus.skillResponse
    generatePandingEventThenSetNextPandingEventSkill(gameStatus, {
        originId: originPlayer.playerId,
        pandingNameKey: CARD_CONFIG.BA_GUA_ZHEN.key
    })
}

exports.handleBaGuaZhenResponse = handleBaGuaZhenResponse;
