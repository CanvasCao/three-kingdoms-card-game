const {findOnGoingUseStrikeEvent} = require("../../event/utils");
const {findOnGoingUseStrikeEventSkill} = require("../../event/utils");
const {throwCards} = require("../../utils/cardUtils")

const handleCiXiongShuangGuJianResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];

    const onGoingUseStrikeEvent = findOnGoingUseStrikeEvent(gameStatus);
    const onGoingUseStrikeEventSkill = findOnGoingUseStrikeEventSkill(gameStatus);

    if (!chooseToReleaseSkill) {
        if (onGoingUseStrikeEventSkill.chooseToReleaseSkill === undefined) {
            // 放弃CiXiongShuangGuJian
        } else {
            // 不弃牌伤害来源摸一张
            gameStatus.players[onGoingUseStrikeEvent.originId].drawCards(gameStatus,1)
        }
        onGoingUseStrikeEventSkill.done = true;
        return
    }

    if (onGoingUseStrikeEventSkill.chooseToReleaseSkill === undefined) {
        onGoingUseStrikeEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
        gameStatus.skillResponse.playerId = onGoingUseStrikeEvent.targetId;// 修改技能使用人的目标
    } else {
        originPlayer.removeCards(response.cards);
        throwCards(gameStatus, response.cards);

        onGoingUseStrikeEventSkill.releaseCards = response.cards
        onGoingUseStrikeEventSkill.done = true;

        delete gameStatus.skillResponse
    }
}

exports.handleCiXiongShuangGuJianResponse = handleCiXiongShuangGuJianResponse;
