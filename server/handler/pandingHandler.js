const {generateTieSuoTempStorageByShandian, setGameStatusByTieSuoTempStorage} = require("../utils/tieSuoUtils");
const {isNil} = require("lodash");
const {emitNotifyPandingPlayPublicCard} = require("../utils/emitUtils");
const {getCurrentPlayer, getNextShandianPlayer} = require("../utils/playerUtils");
const {getNextNeedExecutePandingSign} = require("../utils/pandingUtils");
const {DELAY_SCROLL_CARDS_CONFIG, CARD_HUASE} = require("../config/cardConfig")
const {getCards, throwCards} = require("../utils/cardUtils")

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
const pandingHandler = {
    executeNextOnePanding: (gameStatus) => {
        const currentPlayer = getCurrentPlayer(gameStatus);
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

        // 判定未生效 需要跳过
        if (nextNeedPandingSign.isEffect === false) {
            if (isPandingLebusishu) {
                currentPlayer.removePandingSign(nextNeedPandingSign);
                throwCards(gameStatus, pandingActualCard);
            } else if (isPandingShandian) {
                moveShandianToNextPlayer(gameStatus, nextNeedPandingSign)
            }
        }
        // 判定生效 开始判定
        else if (nextNeedPandingSign.isEffect === true) {
            const pandingResultCard = getCards(gameStatus, 1);
            throwCards(gameStatus, pandingResultCard);
            emitNotifyPandingPlayPublicCard(gameStatus, pandingResultCard, currentPlayer, pandingCard);

            if (isPandingLebusishu) {
                currentPlayer.removePandingSign(nextNeedPandingSign);
                throwCards(gameStatus, pandingActualCard);
                if (pandingResultCard.huase !== CARD_HUASE.HONGTAO) {
                    currentPlayer.skipPlay = true;
                }
            } else if (isPandingShandian) {
                currentPlayer.judgedShandian = true;
                if (pandingResultCard.huase == CARD_HUASE.HEITAO && pandingResultCard.number >= 2 && pandingResultCard.number <= 9) {
                    currentPlayer.removePandingSign(nextNeedPandingSign);
                    throwCards(gameStatus, pandingActualCard);

                    currentPlayer.reduceBlood(3);
                    generateTieSuoTempStorageByShandian(gameStatus);

                    if (currentPlayer.currentBlood > 0) { // <0 setGameStatusByTieSuoTempStorage的逻辑在求桃之后 如果我还活着需要立刻结算下一个人的铁锁连环
                        setGameStatusByTieSuoTempStorage(gameStatus);
                    }
                } else {
                    moveShandianToNextPlayer(gameStatus, nextNeedPandingSign)
                }
            }
        }
    }
}

exports.pandingHandler = pandingHandler;