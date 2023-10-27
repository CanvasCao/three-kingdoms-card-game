const {ACTION} = require("../action/action");
const _clearDeadPlayerInAllResponse = (gameStatus, player) => {
    if (gameStatus.skillResponse?.playerId == player.playerId) {
        delete gameStatus.skillResponse
    }

    if (gameStatus.cardResponse?.originId == player.playerId) {
        delete gameStatus.cardResponse
    }

    // AOE
    gameStatus.scrollStorages = gameStatus.scrollStorages.filter((scrollStorage) => {
        return scrollStorage.originId !== player.playerId
    })
}

const setStatusWhenPlayerDie = (gameStatus, player) => {
    player.resetHero(gameStatus);
    _clearDeadPlayerInAllResponse(gameStatus, player)

    if (player.canRebirth) {
        ACTION.draw(gameStatus, player, 3)
        player.currentBlood = 3;
        delete player.canRebirth;
    } else {
        player.isDead = true;

        const winnerTeamName = getIfGameEndWinnerTeamName(gameStatus)
        // 游戏结束
        if (winnerTeamName) {
            gameStatus.gameEnd = {
                winnerTeamName,
            }
        }
    }
}

const getIfGameEndWinnerTeamName = (gameStatus) => {
    const players = gameStatus.players;
    let cache = {};

    for (const playerId in players) {
        const player = players[playerId];
        if (!player.isDead) {
            if (!cache[player.teamName]) {
                cache[player.teamName] = true;
            }
        }
    }

    if (Object.keys(cache).length > 1) {
        return false
    }

    return Object.keys(cache)[0];
}

exports.setStatusWhenPlayerDie = setStatusWhenPlayerDie;