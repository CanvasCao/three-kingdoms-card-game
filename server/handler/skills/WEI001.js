const {CARD_LOCATION} = require("../../config/cardConfig");
const {emitNotifyMoveCards} = require("../../utils/emitUtils");
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
            gameStatus.throwedCards = differenceBy(gameStatus.throwedCards, onGoingDamageEvent.damageCards, 'cardId');
            gameStatus.players[onGoingDamageEvent.targetId].addCards(onGoingDamageEvent.damageCards);

            emitNotifyMoveCards(gameStatus,
                CARD_LOCATION.TABLE,
                gameStatus.players[onGoingDamageEvent.targetId].playerId,
                onGoingDamageEvent.damageCards,
                true)
        }

        delete gameStatus.skillResponse
    }
}


exports.handleWei001JianXiongResponse = handleWei001JianXiongResponse;
