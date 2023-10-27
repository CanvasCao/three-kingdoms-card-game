const {CARD_LOCATION} = require("../config/cardConfig");
const {emitNotifyMoveCards} = require("../utils/emitUtils");
const {clearNextScrollStorage} = require("../utils/scrollStorage")
const wuguBoardHandler = {
    handleWuGuBoard(gameStatus, data) {
        const wuguPlayer = gameStatus.players[data.playerId]
        emitNotifyMoveCards(gameStatus,
            CARD_LOCATION.TABLE,
            wuguPlayer.playerId,
            [data.card],
            true)


        gameStatus.wugufengdengCards.find((c) => c.cardId == data.card.cardId).wugefengdengSelectedPlayerId = data.playerId
        wuguPlayer.addCards(data.card);
        clearNextScrollStorage(gameStatus);
    }
}

exports.wuguBoardHandler = wuguBoardHandler;