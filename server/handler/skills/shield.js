const {CARD_CONFIG} = require("../../config/cardConfig");
const {generatePandingEventThenSetNextPandingEventSkillToSkillResponse} = require("../../event/pandingEvent");
const {setNextPlayEventSkillToSkillResponse} = require("../../event/playEvent");
const {findOnGoingEvent} = require("../../event/utils");
const {findOnGoingEventSkill} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");
const {throwCards} = require("../../utils/cardUtils")

const handleBaGuaZhenResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];

    const onGoingPlayEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.PLAY_EVENTS);
    onGoingPlayEventSkill.done = true;

    if (!chooseToReleaseSkill) {
        setNextPlayEventSkillToSkillResponse(gameStatus)
        return
    }

    delete gameStatus.skillResponse
    generatePandingEventThenSetNextPandingEventSkillToSkillResponse(gameStatus, {
        originId: originPlayer.playerId,
        pandingNameKey: CARD_CONFIG.BA_GUA_ZHEN.key
    })
}

exports.handleBaGuaZhenResponse = handleBaGuaZhenResponse;
