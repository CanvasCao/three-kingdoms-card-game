const {CARD_LOCATION} = require("../config/cardConfig");
const {emitNotifyMoveCards} = require("../utils/emitUtils");
const {clearNextScrollResponse} = require("../utils/responseUtils")
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
        clearNextScrollResponse(gameStatus);
    }
}

exports.wuguBoardHandler = wuguBoardHandler;