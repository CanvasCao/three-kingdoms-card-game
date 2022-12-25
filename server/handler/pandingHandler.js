const {isNil} = require("lodash");
const {emitPandingPublicCard} = require("../utils/utils");
const {getCurrentUser, getNextShandianUser} = require("../utils/userUtils");
const {getNextNeedExecutePandingSign} = require("../utils/pandingUtils");
const {DELAY_SCROLL_CARDS_CONFIG} = require("../initCards")
const {getCards, throwCards} = require("../utils/cardUtils")

const moveShandianToNextUser = (gameStatus) => {
    const currentUser = getCurrentUser(gameStatus);
    const nextUser = getNextShandianUser(gameStatus);
    const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus);

    // 如果人人有闪电 那么闪电原地不动
    if (currentUser.userId != nextUser.userId) {
        nextNeedPandingSign.isEffect = undefined;
        currentUser.removePandingSign(nextNeedPandingSign);
        nextUser.pandingSigns.push(nextNeedPandingSign);
    }
}
const pandingHandler = {
    executeNextOnePanding: (gameStatus) => {
        const currentUser = getCurrentUser(gameStatus);
        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus);
        if (!nextNeedPandingSign) {
            throw new Error("用户没有需要判定的牌")
        }
        if (isNil(nextNeedPandingSign.isEffect)) {
            throw new Error("判定未生效 不能开始判定")
        }

        const pandingCard = nextNeedPandingSign.card;
        const pandingActualCard = nextNeedPandingSign.actualCard;
        const isPandingLebusishu = pandingActualCard.CN == DELAY_SCROLL_CARDS_CONFIG.LE_BU_SI_SHU.CN;
        const isPandingShandian = pandingActualCard.CN == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN;

        if (nextNeedPandingSign.isEffect === false) {
            if (isPandingLebusishu) {
                currentUser.removePandingSign(nextNeedPandingSign);
                throwCards(gameStatus, pandingActualCard);
            } else if (isPandingShandian) {
                moveShandianToNextUser(gameStatus)
            }
        } else if (nextNeedPandingSign.isEffect === true) {
            const pandingResultCard = getCards(gameStatus, 1);
            throwCards(gameStatus, pandingResultCard);
            emitPandingPublicCard(gameStatus, pandingResultCard, currentUser, pandingCard);

            if (isPandingLebusishu) {
                currentUser.removePandingSign(nextNeedPandingSign);
                throwCards(gameStatus, pandingActualCard);
                if (pandingResultCard.huase !== "♥️") {
                    currentUser.skipPlay = true;
                }
            } else if (isPandingShandian) {
                currentUser.judgedShandian = true;
                if (pandingResultCard.huase == "♠️️" && pandingResultCard.number >= 2 && pandingResultCard.number <= 9) {
                    currentUser.removePandingSign(nextNeedPandingSign);
                    throwCards(gameStatus, pandingActualCard);

                    currentUser.reduceBlood(3);
                    this.generateTieSuoTempStorageByShandian();

                    if (currentUser.currentBlood > 0) { // <0 setStateByTieSuoTempStorage的逻辑在求桃之后 如果我还活着需要立刻结算下一个人的铁锁连环
                        this.setStateByTieSuoTempStorage();
                    }
                } else {
                    moveShandianToNextUser(gameStatus)
                }
            }
        }
    }
}

exports.pandingHandler = pandingHandler;