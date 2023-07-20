const {getHeroConfig} = require("../config/heroConfig");
const heroSelectBoardBoardHandler = {
    handleHeroSelect(gameStatus, data) {
        const {playerId, heroId} = data

        const heroConfig = getHeroConfig(heroId)
        gameStatus.players[playerId].heroId = heroId;
        gameStatus.players[playerId].setPlayerConfig(heroConfig)
    }
}

exports.heroSelectBoardBoardHandler = heroSelectBoardBoardHandler;