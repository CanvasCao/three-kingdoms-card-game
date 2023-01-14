const {clearNextScrollStage} = require("../utils/clearStageUtils")
const wuguBoardHandler = {
    handleWuGuBoard(gameStatus, data) {
        const wuguPlayer = gameStatus.players[data.playerId]

        gameStatus.wugufengdengCards.find((c) => c.cardId == data.card.cardId).wugefengdengSelectedPlayerId = data.playerId
        wuguPlayer.addCards(data.card);
        clearNextScrollStage(gameStatus)
    }
}

exports.wuguBoardHandler = wuguBoardHandler;