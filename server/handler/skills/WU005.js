const {emitNotifyAddLines} = require("../../utils/emitUtils");
const {SKILL_CONFIG} = require("../../config/skillsConfig");

const handleWu005FanJianAction = (gameStatus) => {
    const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;
    const player = gameStatus.players[originId]

    gameStatus.fanjianBoardResponse = {
        originId: targetIds[0],
    }
    player.addUseSkillTimes(SKILL_CONFIG.WU005_FAN_JIAN.key);

    emitNotifyAddLines(gameStatus, {
        fromId: originId,
        toIds: targetIds,
    });
}

exports.handleWu005FanJianAction = handleWu005FanJianAction;
