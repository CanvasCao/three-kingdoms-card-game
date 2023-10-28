const {SCROLL_CARDS_CONFIG} = require("../../config/cardConfig");
const {generateResponseCardEventThenSetNextResponseCardEventSkill} = require("../../event/responseCardEvent");
const {emitNotifyAddLines} = require("../../utils/emitUtils");
const {SKILL_CONFIG} = require("../../config/skillsConfig")
const {ACTION} = require("../../action/action")

const handleQun003LiJianAction = (gameStatus) => {
    const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;
    const originPlayer = gameStatus.players[originId]
    const playShaFirstPlayer = gameStatus.players[targetIds[0]]
    const playSecondPlayer = gameStatus.players[targetIds[1]]

    originPlayer.addUseSkillTimes(SKILL_CONFIG.QUN003_LI_JIAN.key);

    emitNotifyAddLines(gameStatus, {
        fromId: playSecondPlayer.playerId,
        toIds: [playShaFirstPlayer.playerId],
    });

    ACTION.discard(gameStatus, originPlayer, cards, SKILL_CONFIG.QUN003_LI_JIAN.key)

    generateResponseCardEventThenSetNextResponseCardEventSkill(gameStatus, {
        originId: playShaFirstPlayer.playerId,
        targetId: playSecondPlayer.playerId,
        actionCards: [],
        actionActualCard: {key: SCROLL_CARDS_CONFIG.JUE_DOU.key},
    })
}

exports.handleQun003LiJianAction = handleQun003LiJianAction;
