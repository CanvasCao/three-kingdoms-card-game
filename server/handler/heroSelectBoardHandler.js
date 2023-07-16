const {tryGoToNextPlayOrResponseOrThrowTurn} = require("../utils/stageUtils");
const {everyoneGetInitialCards} = require("../utils/cardUtils");
const {setGameStatusStage} = require("../utils/stageUtils");
const heroSelectBoardBoardHandler = {
    handleHeroSelect(gameStatus, data) {
        const {playerId, heroId} = data
        gameStatus.players[playerId].heroId = heroId;

        if (Object.values(gameStatus.players).every((p) => p.heroId)) {
            setGameStatusStage(gameStatus)
            everyoneGetInitialCards(gameStatus)
            tryGoToNextPlayOrResponseOrThrowTurn(gameStatus)
        }
    }
}

exports.heroSelectBoardBoardHandler = heroSelectBoardBoardHandler;