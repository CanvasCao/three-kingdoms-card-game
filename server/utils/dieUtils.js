const {throwCards} = require("../utils/cardUtils")
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

    // 之后如果还需要出闪也不用出了
    gameStatus.shanResStages = gameStatus.shanResStages.filter((rs) => rs.originId !== player.playerId)
}

exports.setStatusWhenPlayerDie = setStatusWhenPlayerDie;