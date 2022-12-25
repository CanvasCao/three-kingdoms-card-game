const {DELAY_SCROLL_CARDS_CONFIG} = require("../initCards");
const {getCurrentUser} = require("./userUtils");

const getNextNeedExecutePandingSign = (gameStatus) => {
    const currentUser = getCurrentUser(gameStatus);

    // 如果闪电移动到自己身上 且闪电判定过 直接到下回合
    const needPandingSigns = currentUser.judgedShandian ?
        currentUser.pandingSigns.filter((sign) => sign.actualCard.CN !== DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN) :
        currentUser.pandingSigns;

    return needPandingSigns[0];
}

exports.getNextNeedExecutePandingSign = getNextNeedExecutePandingSign;
