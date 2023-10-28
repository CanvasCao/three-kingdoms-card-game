const {emitNotifyAddLines} = require("../../utils/emitUtils");
const {SKILL_CONFIG} = require("../../config/skillsConfig")
const {ACTION} = require("../../action/action")

const handleQun001QingNangAction = (gameStatus) => {
    const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;
    const originPlayer = gameStatus.players[originId]
    const targetPlayer = gameStatus.players[targetIds[0]]

    originPlayer.addUseSkillTimes(SKILL_CONFIG.QUN001_QING_NANG.key);

    emitNotifyAddLines(gameStatus, {
        fromId: originId,
        toIds: targetIds,
    });

    ACTION.discard(gameStatus, originPlayer, cards, SKILL_CONFIG.QUN001_QING_NANG.key)
    targetPlayer.addBlood()
}

exports.handleQun001QingNangAction = handleQun001QingNangAction;
