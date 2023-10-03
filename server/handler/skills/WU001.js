const handleWu001ZhiHengAction = (gameStatus) => {
    const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;

    gameStatus.players[originId].drawCards(gameStatus, cards.length);

    gameStatus.players[originId].zhiHengTimes++
}

exports.handleWu001ZhiHengAction = handleWu001ZhiHengAction;
