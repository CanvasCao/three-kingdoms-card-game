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
}

exports.setStatusWhenPlayerDie = setStatusWhenPlayerDie;