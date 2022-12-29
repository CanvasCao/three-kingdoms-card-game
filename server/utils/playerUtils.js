const {DELAY_SCROLL_CARDS_CONFIG, SCROLL_CARDS_CONFIG} = require("../initCards")

const getCurrentPlayer = (gameStatus) => {
    return Object.values(gameStatus.players).find((u) => u.location == gameStatus.currentLocation)
}

const getNextShandianPlayer = (gameStatus) => {
    const filtered = Object.values(gameStatus.players).filter((u) => {
        return !u.isDead && !u.pandingSigns.find(sign => sign.actualCard.CN == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN)
    });

    if (filtered.length == 0) { //人人有闪电 闪电就不移动
        return getCurrentPlayer(gameStatus)
    }

    const sorted = filtered.sort((a, b) => a.location - b.location);
    const nextPlayer = sorted.find((u) => u.location > gameStatus.currentLocation);
    return nextPlayer ? nextPlayer : sorted[0]
}

const getAllHasWuxiePlayers = (gameStatus) => {
    return Object.values(gameStatus.players).filter((u) => u.cards.map((c) => c.CN).includes(SCROLL_CARDS_CONFIG.WU_XIE_KE_JI.CN));
}

exports.getCurrentPlayer = getCurrentPlayer;
exports.getNextShandianPlayer = getNextShandianPlayer;
exports.getAllHasWuxiePlayers = getAllHasWuxiePlayers;