const {DELAY_SCROLL_CARDS_CONFIG, SCROLL_CARDS_CONFIG} = require("../config/cardConfig")

const getCurrentPlayer = (gameStatus) => {
    return Object.values(gameStatus.players).find((u) => u.location == gameStatus.stage.getCurrentLocation())
}

const getNextShandianPlayer = (gameStatus) => {
    const filtered = Object.values(gameStatus.players).filter((player) => {
        return !player.isDead && !player.pandingSigns.find(sign => sign.actualCard.key == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.key)
    });

    if (filtered.length == 0) { // 人人有闪电 闪电就不移动
        return getCurrentPlayer(gameStatus)
    }

    const sorted = filtered.sort((a, b) => a.location - b.location);
    const nextPlayer = sorted.find((player) => player.location > gameStatus.stage.getCurrentLocation());
    return nextPlayer ? nextPlayer : sorted[0]
}

const getAllHasWuxiePlayers = (gameStatus) => {
    return Object.values(gameStatus.players).filter((player) => player.cards.map((c) => c.key).includes(SCROLL_CARDS_CONFIG.WU_XIE_KE_JI.key));
}

const getAllAlivePlayersStartFromFirstLocation = (gameStatus, firstLocation) => {
    const players = []
    for (let i = firstLocation; i < firstLocation + Object.keys(gameStatus.players).length; i++) {
        const modLocation = i % Object.keys(gameStatus.players).length;
        const player = Object.values(gameStatus.players).find((player) => player.location == modLocation);
        if (!player.isDead) {
            players.push(player)
        }
    }
    return players;
}

exports.getCurrentPlayer = getCurrentPlayer;
exports.getNextShandianPlayer = getNextShandianPlayer;
exports.getAllHasWuxiePlayers = getAllHasWuxiePlayers;
exports.getAllAlivePlayersStartFromFirstLocation = getAllAlivePlayersStartFromFirstLocation;