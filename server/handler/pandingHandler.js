const {emitPandingPublicCard} = require("../utils/utils");
const {getCurrentUser} = require("../utils/userUtils");
const {DELAY_SCROLL_CARDS_CONFIG} = require("../initCards")
const {getCards} = require("../utils/cardUtils")
const pandingHandler = {
    executeNextOnePanding: (gameStatus) => {
        const user = getCurrentUser(gameStatus);
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
        } else if (pandingCard.CN == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN) {
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
        }
    }

}

exports.pandingHandler = pandingHandler;