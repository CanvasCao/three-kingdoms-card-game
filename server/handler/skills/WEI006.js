const {ACTION} = require("../../action/action");
const {findOnGoingEvent} = require("../../event/utils");
const {findOnGoingEventSkill} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");

const handleWei006YiJiResponse = (gameStatus, response) => {
    const {chooseToResponse, cards, originId, skillTargetIds} = response;
    const originPlayer = gameStatus.players[originId];

    const onGoingDamageEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);
    const onGoingDamageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);

    if (!chooseToResponse) {
        onGoingDamageEventSkill.done = true;
        originPlayer.cards.forEach((card) => {
            delete card.isYiJi;
        })
        return
    }

    if (onGoingDamageEventSkill.chooseToReleaseSkill === undefined) { // 选择发动遗计
        onGoingDamageEventSkill.chooseToReleaseSkill = chooseToResponse
        ACTION.draw(gameStatus, originPlayer)

        const length = originPlayer.cards.length;
        originPlayer.cards[length - 1].isYiJi = true
        originPlayer.cards[length - 2].isYiJi = true
    } else { // 给牌
        const getCardsPlayer = gameStatus.players[skillTargetIds[0]];
        ACTION.give(gameStatus, originPlayer, getCardsPlayer, cards, false)

        if (!originPlayer.cards.find(card => card.isYiJi)) {
            onGoingDamageEventSkill.done = true;
            delete gameStatus.skillResponse
        }
    }
}


exports.handleWei006YiJiResponse = handleWei006YiJiResponse;
