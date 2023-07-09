const {throwCards} = require("../utils/cardUtils")

const _clearDeadPlayerInAllResponse = (gameStatus, player) => {
    if (gameStatus.skillResponse?.playerId == player.playerId) {
        delete gameStatus.skillResponse
    }

    if (gameStatus.shanResponse?.originId == player.playerId) {
        delete gameStatus.shanResponse
    }

    // AOE
    gameStatus.scrollResponses = gameStatus.scrollResponses.filter((res) => {
        return res.originId !== player.playerId
    })
}

const setStatusWhenPlayerDie = (gameStatus, player) => {
    player.isDead = true;

    let needThrowCards = [
        ...player.cards,
        player.weaponCard,
        player.shieldCard,
        player.plusHorseCard,
        player.minusHorseCard,
        ...player.pandingSigns.map((sign) => sign.actualCard),
    ];
    needThrowCards = needThrowCards.filter(x => !!x)
    throwCards(gameStatus, needThrowCards);

    player.resetWhenDie();

    _clearDeadPlayerInAllResponse(gameStatus,player)
}

exports.setStatusWhenPlayerDie = setStatusWhenPlayerDie;