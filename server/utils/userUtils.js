const {DELAY_SCROLL_CARDS_CONFIG, SCROLL_CARDS_CONFIG} = require("../initCards")

const getCurrentUser = (gameStatus) => {
    return Object.values(gameStatus.users).find((u) => u.location == gameStatus.currentLocation)
}

const setCurrentLocationToNextLocation = (gameStatus) => {
    const filteredNotDead = Object.values(gameStatus.users).filter((u) => !u.isDead);
    if (filteredNotDead.length == 0) {
        throw new Error("Everyone is dead. Game Over")
    }
    const sorted = filteredNotDead.sort((a, b) => a.location - b.location)

    // 可能会在自己的回合自杀 所以不能找到自己再+1
    const nextUser = sorted.find((u) => u.location > gameStatus.currentLocation);
    if (nextUser) {
        gameStatus.currentLocation = nextUser.location
    } else {
        gameStatus.currentLocation = sorted[0].location
    }
}

const getNextShandianUser = (gameStatus) => {
    const filtered = Object.values(gameStatus.users).filter((u) => {
        return !u.isDead && !u.pandingCards.find(c => c.CN == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN)
    });
    const sorted = filtered.sort((a, b) => a.location - b.location);
    const nextUser = sorted.find((u) => u.location > gameStatus.currentLocation);
    return nextUser ? nextUser : sorted[0]
}

const getAllHasWuxiePlayers = (gameStatus) => {
    return Object.values(gameStatus.users).filter((u) => u.cards.map((c) => c.CN).includes(SCROLL_CARDS_CONFIG.WU_XIE_KE_JI.CN));
}

exports.getCurrentUser = getCurrentUser;
exports.setCurrentLocationToNextLocation = setCurrentLocationToNextLocation;
exports.getNextShandianUser = getNextShandianUser;
exports.getAllHasWuxiePlayers = getAllHasWuxiePlayers;