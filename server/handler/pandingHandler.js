const {emitPandingPublicCard} = require("../utils/utils");
const {getCurrentUser} = require("../utils/userUtils");
const {DELAY_SCROLL_CARDS_CONFIG} = require("../initCards")
const {getCards} = require("../utils/cardUtils")
const pandingHandler = {
    executePanding: (gameStatus, goToNextStage, tryGoNextStage) => {
        const user = getCurrentUser(gameStatus);
        if (user.pandingCards.length == 0) {
            goToNextStage(gameStatus);
            return
        }
        if (user.pandingCards.length > 0) {
            const pandingResultCard = getCards(gameStatus, 1);
            throwCards(gameStatus, [pandingResultCard]);
            const pandingCard = user.pandingCards[user.pandingCards.length - 1]

            emitPandingPublicCard(this.io, pandingResultCard, user, pandingCard);

            if (pandingCard.CN == DELAY_SCROLL_CARDS_CONFIG.LE_BU_SI_SHU.CN) {
                user.removePandingCard(pandingCard);
                throwCards(gameStatus, [pandingCard]);
                if (pandingResultCard.huase !== "♥️") {
                    user.skipPlay = true;
                }
                tryGoNextStage(gameStatus);// 如果还有别的判定牌会再一次回到这里
            } else if (pandingCard.CN == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN) {
                // 如果闪电移动到自己身上 且闪电判定过 直接到下回合
                if (user.judgedShandian &&
                    user.pandingCards.length == 1 &&
                    user.pandingCards[0].CN == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN) {
                    goToNextStage(gameStatus);
                    return;
                }

                if (pandingResultCard.huase == "♠️️" && pandingResultCard.number >= 2 && pandingResultCard.number <= 9) {
                    user.removePandingCard(pandingCard);
                    throwCards(gameStatus, [pandingCard]);

                    user.reduceBlood(3);
                    this.generateTieSuoTempStorageByShandian();

                    if (user.currentBlood > 0) { // <0 setStateByTieSuoTempStorage的逻辑在求桃之后 如果我还活着需要立刻结算下一个人的铁锁连环
                        this.setStateByTieSuoTempStorage();
                    }
                } else {
                    const nextUser = getNextShandianUser(gameStatus);
                    // 如果人人有闪电 那么闪电原地不动
                    user.removePandingCard(pandingCard);
                    nextUser.pandingCards.push(pandingCard);
                }
                user.judgedShandian = true;
                tryGoNextStage(gameStatus);// 如果还有别的判定牌会再一次回到这里
            }
        }
    }
}

exports.pandingHandler = pandingHandler;