const {DELAY_SCROLL_CARDS_CONFIG, SCROLL_CARDS_CONFIG} = require("../initCards")

const getCurrentUser = (gameStatus) => {
    return Object.values(gameStatus.users).find((u) => u.location == gameStatus.currentLocation)
}

const getNextShandianUser = (gameStatus) => {
    const filtered = Object.values(gameStatus.users).filter((u) => {
        return !u.isDead && !u.pandingSigns.find(sign => sign.actualCard.CN == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN)
    });

    if (filtered.length == 0) { //人人有闪电 闪电就不移动
        return getCurrentUser(gameStatus)
    }

    const sorted = filtered.sort((a, b) => a.location - b.location);
    const nextUser = sorted.find((u) => u.location > gameStatus.currentLocation);
    return nextUser ? nextUser : sorted[0]
}

const getAllHasWuxieUsers = (gameStatus) => {
    return Object.values(gameStatus.users).filter((u) => u.cards.map((c) => c.CN).includes(SCROLL_CARDS_CONFIG.WU_XIE_KE_JI.CN));
}

exports.getCurrentUser = getCurrentUser;
exports.getNextShandianUser = getNextShandianUser;
exports.getAllHasWuxieUsers = getAllHasWuxieUsers;