const {STAGE_NAMES, STAGE_NAME} = require("../config/gameConfig");
const {emitNotifyDrawCards} = require("./emitUtils");
const {getNextNeedExecutePandingSign} = require("./pandingUtils");
const {SCROLL_CARDS_CONFIG} = require("../config/cardConfig");
const {getAllHasWuxiePlayers, getCurrentPlayer} = require("./playerUtils");
const {getCards} = require("./cardUtils");
const {clearNextScrollResponse, clearWuxieSimultaneousResponse} = require("./responseUtils");

const generateWuxieSimultaneousResponseByScroll = (gameStatus) => {
    if (!gameStatus.scrollResponses?.[0]) {
        throw Error("没有scrollResponse 不能生成wuxieSimultaneousResponse")
    }

    const action = gameStatus.action;
    const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus);
    if (hasWuxiePlayers.length <= 0) {
        throw Error("没有人有无懈可击 不需要生成wuxieSimultaneousResponse")
    }

    gameStatus.wuxieSimultaneousResponse = {
        hasWuxiePlayerIds: hasWuxiePlayers.map((u) => u.playerId),
        wuxieChain: [{
            cards: action.cards,
            actualCard: action.actualCard
        }]
    }
}

const generateWuxieSimultaneousResponseByPandingCard = (gameStatus) => {
    const nextPandingSign = getNextNeedExecutePandingSign(gameStatus);
    const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus);
    if (hasWuxiePlayers.length <= 0) {
        throw Error("没有人有无懈可击 不需要生成wuxieSimultaneousResponse")
    }
    gameStatus.wuxieSimultaneousResponse = {
        hasWuxiePlayerIds: hasWuxiePlayers.map((u) => u.playerId),
        wuxieChain: [{
            cards: [nextPandingSign.card],
            actualCard: nextPandingSign.actualCard
        }]
    }
}


// 延时锦囊生效之后 set pandingSigns isEffect true/false 给executeNextOnePanding执行
// 即时锦囊生效 set scrollResponses isEffect true 或 clear scrollResponses
const setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect = (gameStatus, from) => {
    // console.log("from", from)
    if (gameStatus.wuxieSimultaneousResponse.hasWuxiePlayerIds.length != 0) {
        throw new Error("还有人思考无懈可击 无法开始结算锦囊");
    }

    const isScrollEffected = (gameStatus.wuxieSimultaneousResponse.wuxieChain.length % 2 == 1) || // wuxieChain长度为奇数个 锦囊生效
        gameStatus.wuxieSimultaneousResponse.wuxieChain.length == 0 // 不求无懈直接生效

    // 延时锦囊
    if (STAGE_NAMES[gameStatus.stage.stageIndex] == STAGE_NAME.JUDGE) {
        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus);
        nextNeedPandingSign.isEffect = isScrollEffected; // 延时锦囊生效开始判定 未生效需要跳过判定
    }

    // 即时锦囊
    else if (gameStatus.scrollResponses.length > 0) {
        const curScrollResponse = gameStatus.scrollResponses[0]
        if (isScrollEffected) {// 生效
            if (curScrollResponse.actualCard.key == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.key) {
                const player = getCurrentPlayer(gameStatus)
                player.drawCards(gameStatus);
                clearNextScrollResponse(gameStatus);
            } else if (curScrollResponse.actualCard.key == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.key) {
                gameStatus.players[curScrollResponse.originId].addBlood();
                clearNextScrollResponse(gameStatus);
            } else {
                curScrollResponse.isEffect = true;
            }
        } else { // 失效
            clearNextScrollResponse(gameStatus);
        }
    }
    clearWuxieSimultaneousResponse(gameStatus); // 生效后清空WuxieResponse


    // 无懈可击失效以后 下一个人的锦囊需要继续求无懈可击
    if (gameStatus.scrollResponses.length > 0 && gameStatus.scrollResponses[0].isEffect === undefined
    ) {
        const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus)
        if (hasWuxiePlayers.length > 0) {
            generateWuxieSimultaneousResponseByScroll(gameStatus)
        } else { // 没人有无懈可击直接生效
            setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, gameStatus.scrollResponses[0].actualCard.key);
        }
    }
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