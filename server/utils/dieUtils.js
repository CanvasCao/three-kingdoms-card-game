const _clearDeadPlayerInAllResponse = (gameStatus, player) => {
    if (gameStatus.skillResponse?.playerId == player.playerId) {
        delete gameStatus.skillResponse
    }

    if (gameStatus.cardResponse?.originId == player.playerId) {
        delete gameStatus.cardResponse
    }

    // AOE
    gameStatus.scrollResponses = gameStatus.scrollResponses.filter((res) => {
        return res.originId !== player.playerId
    })
}

const setStatusWhenPlayerDie = (gameStatus, player) => {
    player.resetHero(gameStatus);
    _clearDeadPlayerInAllResponse(gameStatus, player)

    if (player.canRebirth) {
        player.drawCards(gameStatus, 3)
        player.currentBlood = 3;
        delete player.canRebirth;
    } else {
        player.isDead = true;
    }
}

exports.setStatusWhenPlayerDie = setStatusWhenPlayerDie;