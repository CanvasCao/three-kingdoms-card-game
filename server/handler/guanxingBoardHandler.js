const {clearGuanXingBoardResponse} = require("../utils/responseUtils");
const guanxingBoardHandler = {
    handleGuanXingBoard(gameStatus, data) {
        const {topCards, bottomCards} = data
        gameStatus.deckCards = [...topCards, ...gameStatus.deckCards, ...bottomCards.reverse()]
        clearGuanXingBoardResponse(gameStatus);
    }
}

exports.guanxingBoardHandler = guanxingBoardHandler;