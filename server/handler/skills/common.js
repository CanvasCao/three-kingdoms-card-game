const {ACTION} = require("../../action/action");
const handleDrawCardsNumberWhenPlayImmediateScroll = (gameStatus, player) => {
    const drawCardsNumberWhenPlayImmediateScroll = player.drawCardsNumberWhenPlayImmediateScroll
    if (drawCardsNumberWhenPlayImmediateScroll) {
        ACTION.draw(gameStatus, player, drawCardsNumberWhenPlayImmediateScroll)
    }
}

exports.handleDrawCardsNumberWhenPlayImmediateScroll = handleDrawCardsNumberWhenPlayImmediateScroll;
