const heroSelectBoardBoardHandler = {
    handleHeroSelect(gameStatus, data) {
        const {playerId, heroId} = data
        gameStatus.players[playerId].heroId = heroId;
    }
}

exports.heroSelectBoardBoardHandler = heroSelectBoardBoardHandler;