const {ACTION} = require("../../action/action");
const {findOnGoingEvent} = require("../../event/utils");
const {findOnGoingEventSkill} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");
const {differenceBy} = require("lodash");

const handleWei001JianXiongResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const onGoingDamageEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);
    const onGoingDamageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);
    onGoingDamageEventSkill.done = true;

    if (chooseToReleaseSkill) {
        if (onGoingDamageEvent.damageCards) {
            const player = gameStatus.players[onGoingDamageEvent.targetId]
            gameStatus.throwedCards = differenceBy(gameStatus.throwedCards, onGoingDamageEvent.damageCards, 'cardId');
            ACTION.getFromTable(gameStatus, player, onGoingDamageEvent.damageCards)
        }

        delete gameStatus.skillResponse
    }
}


exports.handleWei001JianXiongResponse = handleWei001JianXiongResponse;
