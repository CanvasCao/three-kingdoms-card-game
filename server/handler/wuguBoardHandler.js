const {moveCardsToDiscardPile} = require("../utils/cardUtils");
const {ACTION} = require('../action/action');
const {clearNextScrollStorage} = require("../utils/scrollStorage");

const wuguBoardHandler = {
    handleWuGuBoard(gameStatus, data) {
        const {playerId, card} = data
        const wuguPlayer = gameStatus.players[playerId]


        ACTION.getFromTable(gameStatus, wuguPlayer, card)

        gameStatus.wugufengdengCards.find((c) => c.cardId == card.cardId).wugefengdengSelectedPlayerId = playerId
        clearNextScrollStorage(gameStatus);

        if (gameStatus.scrollStorages.length == 0) {
            const cards = gameStatus.wugufengdengCards.filter(card => !card.wugefengdengSelectedPlayerId);
            moveCardsToDiscardPile(gameStatus, cards);
        }
    }
}

exports.wuguBoardHandler = wuguBoardHandler;