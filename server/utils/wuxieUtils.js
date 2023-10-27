const {ACTION} = require("../action/action");
const {generateResponseCardEventThenSetNextResponseCardEventSkill} = require("../event/responseCardEvent");
const {STAGE_NAME} = require("../config/gameAndStageConfig");
const {getNextNeedExecutePandingSign} = require("./pandingUtils");
const {SCROLL_CARDS_CONFIG} = require("../config/cardConfig");
const {getAllHasWuxiePlayers, getCurrentPlayer} = require("./playerUtils");
const {clearWuxieSimultaneousResponse} = require("./responseUtils");
const {clearNextScrollStorage} = require("./scrollStorage");

const _generateWuxieSimultaneousResponse = (gameStatus, cards, actualCard) => {
    const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus);
    if (hasWuxiePlayers.length <= 0) {
        throw Error("没有人有无懈可击 不需要生成wuxieSimultaneousResponse")
    }

    gameStatus.wuxieSimultaneousResponse = {
        hasWuxiePlayerIds: hasWuxiePlayers.map((u) => u.playerId),
        wuxieChain: [{
            cards,
            actualCard
        }]
    }
}

const generateWuxieSimultaneousResponseByScroll = (gameStatus) => {
    if (!gameStatus.scrollStorages?.[0]) {
        throw Error("没有scrollStorage 不能生成wuxieSimultaneousResponse")
    }

    const {cards, actualCard} = gameStatus.action;
    _generateWuxieSimultaneousResponse(gameStatus, cards, actualCard)
}

const generateWuxieSimultaneousResponseByPandingCard = (gameStatus) => {
    const nextPandingSign = getNextNeedExecutePandingSign(gameStatus);
    _generateWuxieSimultaneousResponse(gameStatus, [nextPandingSign.card], nextPandingSign.actualCard)
}


// 延时锦囊生效之后 set pandingSigns isEffect true/false 给executeNextOnePanding执行
// 即时锦囊生效 set scrollStorages isEffect true 或 clear scrollStorages
const setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect = (gameStatus, from) => {
    // console.log("from", from)
    const {stage, wuxieSimultaneousResponse, scrollStorages, players} = gameStatus

    if (wuxieSimultaneousResponse.hasWuxiePlayerIds.length != 0) {
        throw new Error("还有人思考无懈可击 无法开始结算锦囊");
    }

    const isScrollEffected = (wuxieSimultaneousResponse.wuxieChain.length % 2 == 1) || // wuxieChain长度为奇数个 锦囊生效
        wuxieSimultaneousResponse.wuxieChain.length == 0 // 不求无懈直接生效

    // 延时锦囊
    if (stage.getStageName() == STAGE_NAME.JUDGE) {
        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus);
        nextNeedPandingSign.isEffect = isScrollEffected; // 延时锦囊生效开始判定 未生效需要跳过判定
    }

    // 即时锦囊
    else if (scrollStorages.length > 0) {
        const curScrollStorage = scrollStorages[0]
        const {actualCard, originId, targetId, cards} = curScrollStorage
        if (isScrollEffected) { // 生效
            if (actualCard.key == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.key) {
                ACTION.draw(gameStatus, getCurrentPlayer(gameStatus))
                clearNextScrollStorage(gameStatus);
            } else if (actualCard.key == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.key) {
                gameStatus.players[originId].addBlood();
                clearNextScrollStorage(gameStatus);

                // 不写递归的算法
                if (getAllHasWuxiePlayers(gameStatus).length == 0) {
                    scrollStorages.forEach(storage => {
                        players[storage.originId].addBlood();
                        clearNextScrollStorage(gameStatus);
                    })
                }
            } else if (actualCard.key == SCROLL_CARDS_CONFIG.WAN_JIAN_QI_FA.key ||
                actualCard.key == SCROLL_CARDS_CONFIG.NAN_MAN_RU_QIN.key ||
                actualCard.key == SCROLL_CARDS_CONFIG.JUE_DOU.key ||
                actualCard.key == SCROLL_CARDS_CONFIG.JIE_DAO_SHA_REN.key
            ) {
                generateResponseCardEventThenSetNextResponseCardEventSkill(gameStatus, {
                    originId: originId,
                    targetId: targetId,
                    actionCards: cards,
                    actionActualCard: actualCard,
                })
                clearNextScrollStorage(gameStatus);
            } else if (actualCard.key == SCROLL_CARDS_CONFIG.SHUN_SHOU_QIAN_YANG.key ||
                actualCard.key == SCROLL_CARDS_CONFIG.GUO_HE_CHAI_QIAO.key
            ) {
                const targetPlayer = gameStatus.players[targetId]
                if (targetPlayer.hasAnyCardsOrPandingCards()) {
                    gameStatus.cardBoardResponses = [{
                        originId: originId,
                        targetId: targetId,
                        cardBoardContentKey: actualCard.key
                    }]
                }
                clearNextScrollStorage(gameStatus);
            } else  { // 五谷丰登
                curScrollStorage.isEffect = true;
            }
        } else { // 失效
            clearNextScrollStorage(gameStatus);
        }
    }
    clearWuxieSimultaneousResponse(gameStatus); // 生效后清空WuxieResponse
}

const resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie = (gameStatus, response) => {
    // response
    // cards: Card[],
    // actualCard: Card,
    // originId: string,

    // wuxieChain
    // cards: Card[],
    // actualCard: Card,

    const newHasWuxiePlayers = getAllHasWuxiePlayers(gameStatus);
    gameStatus.wuxieSimultaneousResponse.hasWuxiePlayerIds = newHasWuxiePlayers.map(u => u.playerId);
    gameStatus.wuxieSimultaneousResponse.wuxieChain.push({
        cards: response.cards,
        actualCard: response.actualCard,
        cardFromPlayerId: response.originId,
    });
}

exports.generateWuxieSimultaneousResponseByScroll = generateWuxieSimultaneousResponseByScroll;
exports.generateWuxieSimultaneousResponseByPandingCard = generateWuxieSimultaneousResponseByPandingCard;
exports.setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect = setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect;
exports.resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie = resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie;