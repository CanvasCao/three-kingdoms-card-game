const {CARD_CONFIG} = require("../../config/cardConfig");
const {findOnGoingEventSkill} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");
const {getCurrentPlayer} = require("../../utils/playerUtils");

const handleWei005LuoYiResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const onGoingGameStageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.GAME_STAGE_EVENT);
    onGoingGameStageEventSkill.done = true;
    const currentPlayer = getCurrentPlayer(gameStatus)
    if (chooseToReleaseSkill) {
        currentPlayer.drawCards(gameStatus, 1);
        currentPlayer.extraDamageMap = {
            [CARD_CONFIG.SHA.key]: 1,
            [CARD_CONFIG.LEI_SHA.key]: 1,
            [CARD_CONFIG.HUO_SHA.key]: 1,
            [CARD_CONFIG.JUE_DOU.key]: 1,
        }
        delete gameStatus.skillResponse
    } else {
        currentPlayer.drawCards(gameStatus)
    }

}


exports.handleWei005LuoYiResponse = handleWei005LuoYiResponse;
