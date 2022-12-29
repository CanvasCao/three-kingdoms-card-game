const {DELAY_SCROLL_CARDS_CONFIG} = require("../initCards");
const {getCurrentPlayer} = require("./playerUtils");

const getNextNeedExecutePandingSign = (gameStatus) => {
    const currentPlayer = getCurrentPlayer(gameStatus);

    // 如果闪电移动到自己身上 且闪电判定过 直接到下回合
    const needPandingSigns = currentPlayer.judgedShandian ?
        currentPlayer.pandingSigns.filter((sign) => sign.actualCard.CN !== DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN) :
        currentPlayer.pandingSigns;

    return needPandingSigns[0];
}

exports.getNextNeedExecutePandingSign = getNextNeedExecutePandingSign;
