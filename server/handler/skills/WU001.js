const {ACTION} = require("../../action/action");
const handleWu001ZhiHengAction = (gameStatus) => {
    const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;
    const player = gameStatus.players[originId]

    ACTION.discard(gameStatus,player,cards)
    ACTION.draw(gameStatus, player, cards.length)
    player.zhiHengTimes++
}

exports.handleWu001ZhiHengAction = handleWu001ZhiHengAction;
