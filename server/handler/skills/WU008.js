const {emitNotifyAddLines} = require("../../utils/emitUtils");
const {SKILL_CONFIG} = require("../../config/skillsConfig")
const {ACTION} = require("../../action/action")

const handleWu008JieYinAction = (gameStatus, response) => {
    const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;
    const originPlayer = gameStatus.players[originId]
    const targetPlayer = gameStatus.players[targetIds[0]]

    originPlayer.addUseSkillTimes(SKILL_CONFIG.WU008_JIE_YIN.key);

    emitNotifyAddLines(gameStatus, {
        fromId: originId,
        toIds: targetIds,
    });

    ACTION.discard(gameStatus, originPlayer, cards, SKILL_CONFIG.WU008_JIE_YIN.key)
    originPlayer.addBlood()
    targetPlayer.addBlood()
}

exports.handleWu008JieYinAction = handleWu008JieYinAction;
