const {SKILL_CONFIG} = require("../../config/skillsConfig");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");
const {findOnGoingEvent} = require("../../event/utils");
const {findOnGoingEventSkill} = require("../../event/utils");
const {emitNotifyAddLines, emitRefreshStatus} = require("../../utils/emitUtils");
const {ACTION} = require("../../action/action")

const handleWei002FanKuiResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const onGoingDamageEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);
    const onGoingDamageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);

    if (!chooseToReleaseSkill) {
        onGoingDamageEventSkill.done = true;
        return
    }

    if (onGoingDamageEventSkill.chooseToReleaseSkill === undefined) {
        onGoingDamageEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
        emitNotifyAddLines(gameStatus, {
            fromId: onGoingDamageEvent.targetId,
            toIds: [onGoingDamageEvent.originId],
        });
        gameStatus.cardBoardResponses = [{
            originId: onGoingDamageEvent.targetId,
            targetId: onGoingDamageEvent.originId,
            cardBoardContentKey: SKILL_CONFIG.WEI002_FAN_KUI.key
        }]
    } else {
        // onGoingDamageEventSkill.done = true; 在CardBoardHandler
    }
    delete gameStatus.skillResponse;
}

const handleWei002GuiCaiResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];

    const onGoingPandingEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.PANDING_EVENT);
    const onGoingPandingEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.PANDING_EVENT)

    if (!chooseToReleaseSkill) {
        onGoingPandingEventSkill.done = true;
        return
    }

    // 发动
    if (onGoingPandingEventSkill.chooseToReleaseSkill === undefined) {
        onGoingPandingEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
    } else { // 发动+改判
        ACTION.gaiPan(gameStatus, originPlayer, response.cards, onGoingPandingEvent.pandingResultCard,SKILL_CONFIG.WEI002_GUI_CAI.key)

        onGoingPandingEvent.pandingResultCard = response.cards[0]
        onGoingPandingEventSkill.done = true;
        delete gameStatus.skillResponse
        emitRefreshStatus(gameStatus); //为了显示判定Board
    }
}

exports.handleWei002FanKuiResponse = handleWei002FanKuiResponse;
exports.handleWei002GuiCaiResponse = handleWei002GuiCaiResponse;