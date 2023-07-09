const {getAllAlivePlayersStartFromFirstLocation} = require("./playerUtils");

const generateQiuTaoResponses = (gameStatus, qiutaoTargetPlayer) => {
    const currentPlayer = getCurrentPlayer(gameStatus);
    const firstLocation = currentPlayer.location;
    const players = getAllAlivePlayersStartFromFirstLocation(gameStatus, firstLocation)

    gameStatus.taoResponses = players.map((player) => {
        return {
            originId: player.playerId,
            targetId: qiutaoTargetPlayer.playerId,
            cardNumber: 1 - qiutaoTargetPlayer.currentBlood,
        }
    })
}

exports.generateQiuTaoResponses = generateQiuTaoResponses;