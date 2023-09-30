const handleDrawCardsNumberWhenPlayImmediateScroll = (gameStatus, player) => {
    const drawCardsNumberWhenPlayImmediateScroll = player.drawCardsNumberWhenPlayImmediateScroll
    if (drawCardsNumberWhenPlayImmediateScroll) {
        player.drawCards(gameStatus, drawCardsNumberWhenPlayImmediateScroll)
    }
}

exports.handleDrawCardsNumberWhenPlayImmediateScroll = handleDrawCardsNumberWhenPlayImmediateScroll;
