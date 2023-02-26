const {getAllHasWuxiePlayers} = require("../utils/playerUtils");
const {
    generateWuxieSimultaneousResStageByScroll,
    setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect
} = require("../utils/wuxieUtils");
const {clearNextScrollStage} = require("../utils/clearResStageUtils")
const wuguBoardHandler = {
    handleWuGuBoard(gameStatus, data) {
        const wuguPlayer = gameStatus.players[data.playerId]

        gameStatus.wugufengdengCards.find((c) => c.cardId == data.card.cardId).wugefengdengSelectedPlayerId = data.playerId
        wuguPlayer.addCards(data.card);
        clearNextScrollStage(gameStatus);

        if (gameStatus.scrollResStages.length > 0) {
            const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus)
            if (hasWuxiePlayers.length > 0) {
                generateWuxieSimultaneousResStageByScroll(gameStatus)
            } else { // 没人有无懈可击直接生效
                setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, "handleWuGuBoard");
            }
        }
    }
}

exports.wuguBoardHandler = wuguBoardHandler;