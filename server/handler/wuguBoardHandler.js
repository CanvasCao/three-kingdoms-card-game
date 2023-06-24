const {getAllHasWuxiePlayers} = require("../utils/playerUtils");
const {
    generateWuxieSimultaneousResponseByScroll,
    setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect
} = require("../utils/wuxieUtils");
const {clearNextScrollResponse} = require("../utils/clearResponseUtils")
const wuguBoardHandler = {
    handleWuGuBoard(gameStatus, data) {
        const wuguPlayer = gameStatus.players[data.playerId]

        gameStatus.wugufengdengCards.find((c) => c.cardId == data.card.cardId).wugefengdengSelectedPlayerId = data.playerId
        wuguPlayer.addCards(data.card);
        clearNextScrollResponse(gameStatus);

        if (gameStatus.scrollResponses.length > 0) {
            const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus)
            if (hasWuxiePlayers.length > 0) {
                generateWuxieSimultaneousResponseByScroll(gameStatus)
            } else { // 没人有无懈可击直接生效
                setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, "handleWuGuBoard");
            }
        }
    }
}

exports.wuguBoardHandler = wuguBoardHandler;