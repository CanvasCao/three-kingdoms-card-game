const {getCurrentPlayer, getNextShandianPlayer} = require("../utils/playerUtils");
const {DELAY_SCROLL_CARDS_CONFIG} = require("../config/cardConfig")

const getNextNeedExecutePandingSign = (gameStatus) => {
    const currentPlayer = getCurrentPlayer(gameStatus);

    // 如果闪电移动到自己身上 且闪电判定过 直接到下回合
    const needPandingSigns = currentPlayer.judgedShandian ?
        currentPlayer.pandingSigns.filter((sign) => sign.actualCard.key !== DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.key) :
        currentPlayer.pandingSigns;

    return needPandingSigns[0];
}

const moveShandianToNextPlayer = (gameStatus, sign) => {
    const currentPlayer = getCurrentPlayer(gameStatus);
    const nextPlayer = getNextShandianPlayer(gameStatus);

    sign.isEffect = true;
    // isEffect的清空在resetWhenMyTurnStarts
    if (currentPlayer.playerId != nextPlayer.playerId) {
        currentPlayer.removePandingSign(sign);
        nextPlayer.pandingSigns.push(sign);
    } else {
        // 如果人人有闪电 那么闪电原地不动
    }
}

exports.getNextNeedExecutePandingSign = getNextNeedExecutePandingSign;
exports.moveShandianToNextPlayer = moveShandianToNextPlayer;
