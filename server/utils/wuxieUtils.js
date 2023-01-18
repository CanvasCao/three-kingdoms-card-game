const {getNextNeedExecutePandingSign} = require("./pandingUtils");
const {SCROLL_CARDS_CONFIG} = require("../initCards");
const {getAllHasWuxiePlayers, getCurrentPlayer} = require("./playerUtils");
const {getCards} = require("./cardUtils");
const {clearNextScrollStage, clearWuxieResStage} = require("./clearStageUtils");

const generateWuxieSimultaneousResStageByScroll = (gameStatus) => {
    if (!gameStatus.scrollResStages?.[0]) {
        throw Error("没有scrollResStages 不能生成wuxieSimultaneousResStage")
    }

    const action = gameStatus.action;
    const scrollResStage = gameStatus.scrollResStages[0];
    const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus);
    if (hasWuxiePlayers.length <= 0) {
        throw Error("没有人有无懈可击 不需要生成wuxieSimultaneousResStage")
    }

    let nextWuXieTargetId
    // 无懈action origin
    if (action.actualCard.CN == SCROLL_CARDS_CONFIG.SHUN_SHOU_QIAN_YANG.CN ||
        action.actualCard.CN == SCROLL_CARDS_CONFIG.GUO_HE_CHAI_QIAO.CN ||
        action.actualCard.CN == SCROLL_CARDS_CONFIG.JIE_DAO_SHA_REN.CN ||
        action.actualCard.CN == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.CN ||
        action.actualCard.CN == SCROLL_CARDS_CONFIG.JUE_DOU.CN
    ) {
        nextWuXieTargetId = action.originId
    } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.CN ||
        action.actualCard.CN == SCROLL_CARDS_CONFIG.NAN_MAN_RU_QIN.CN ||
        action.actualCard.CN == SCROLL_CARDS_CONFIG.WAN_JIAN_QI_FA.CN ||
        action.actualCard.CN == SCROLL_CARDS_CONFIG.WU_GU_FENG_DENG.CN) {
        nextWuXieTargetId = scrollResStage.originId
    }
    gameStatus.wuxieSimultaneousResStage = {
        hasWuxiePlayerIds: hasWuxiePlayers.map((u) => u.playerId),
        wuxieChain: [{
            nextWuXieTargetId,
            cards: action.cards,
            actualCard: action.actualCard
        }]
    }
}

const generateWuxieSimultaneousResStageByPandingCard = (gameStatus) => {
    const currentPlayer = getCurrentPlayer(gameStatus);
    const nextPandingSign = getNextNeedExecutePandingSign(gameStatus);
    const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus);
    if (hasWuxiePlayers.length <= 0) {
        throw Error("没有人有无懈可击 不需要生成wuxieSimultaneousResStage")
    }
    gameStatus.wuxieSimultaneousResStage = {
        hasWuxiePlayerIds: hasWuxiePlayers.map((u) => u.playerId),
        wuxieChain: [{
            nextWuXieTargetId: currentPlayer.playerId,
            cards: [nextPandingSign.card],
            actualCard: nextPandingSign.actualCard
        }]
    }
}


const setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect = (gameStatus, from) => {
    // console.log(from)
    if (gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds.length != 0) {
        throw new Error("还有人出无懈可击 不可以结算锦囊");
    }

    const isScrollEffected = (gameStatus.wuxieSimultaneousResStage.wuxieChain.length % 2 == 1) || // wuxieChain长度为奇数个 锦囊生效
        gameStatus.wuxieSimultaneousResStage.wuxieChain.length == 0 // 不求无懈直接生效

    // 延时锦囊
    if (gameStatus.stage.stageName == "judge") {
        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus);
        nextNeedPandingSign.isEffect = isScrollEffected; // 延时锦囊生效开始判定 未生效需要跳过判定
    }

    // 即时锦囊
    else if (gameStatus.scrollResStages.length > 0) {
        const curScrollResStage = gameStatus.scrollResStages[0]
        if (isScrollEffected) {// 生效
            if (curScrollResStage.actualCard.CN == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.CN) {
                getCurrentPlayer(gameStatus).addCards(getCards(gameStatus, 2));
                clearNextScrollStage(gameStatus);
            } else if (curScrollResStage.actualCard.CN == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.CN) {
                gameStatus.players[curScrollResStage.originId].addBlood();
                clearNextScrollStage(gameStatus);
            } else if (curScrollResStage.actualCard.CN == SCROLL_CARDS_CONFIG.SHUN_SHOU_QIAN_YANG.CN ||
                curScrollResStage.actualCard.CN == SCROLL_CARDS_CONFIG.GUO_HE_CHAI_QIAO.CN
            ) { // 顺 拆
                curScrollResStage.isEffect = true;
            } else if (curScrollResStage.actualCard.CN == SCROLL_CARDS_CONFIG.NAN_MAN_RU_QIN.CN ||
                curScrollResStage.actualCard.CN == SCROLL_CARDS_CONFIG.WAN_JIAN_QI_FA.CN
            ) {
                curScrollResStage.isEffect = true;
            } else if (curScrollResStage.actualCard.CN == SCROLL_CARDS_CONFIG.JIE_DAO_SHA_REN.CN) {
                curScrollResStage.isEffect = true;
            } else if (curScrollResStage.actualCard.CN == SCROLL_CARDS_CONFIG.JUE_DOU.CN) {
                curScrollResStage.isEffect = true;
            } else if (curScrollResStage.actualCard.CN == SCROLL_CARDS_CONFIG.WU_GU_FENG_DENG.CN) {
                curScrollResStage.isEffect = true;
            }
        } else {// 失效
            clearNextScrollStage(gameStatus);
        }
    }
    clearWuxieResStage(gameStatus); // 生效后清空WuxieResStage

    // 桃园结义很特殊
    // 因为clear scrollResStage之后 不用设置isEffect 直接加血 所以需要递归判断下一个用户
    // 无中生有 只有一个目标 可以递归但是没必要
    if ((gameStatus.scrollResStages.length > 0) && gameStatus.scrollResStages[0].actualCard.CN == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.CN) {
        const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus)
        if (hasWuxiePlayers.length > 0) {
            generateWuxieSimultaneousResStageByScroll(gameStatus)
        } else { // 没人有无懈可击直接生效
            setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, "TAO_YUAN_JIE_YI");
        }
    }
}

const resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie = (gameStatus, response) => {
    // response
    // cards: Card[],
    // actualCard: Card,
    // originId: string,
    // targetId: string,
    //
    // // 为了校验无懈可击是否冲突
    // wuxieTargetCardId?: string,

    // wuxieChain
    // cards: Card[],
    // actualCard: Card,
    // nextWuXieTargetId: string
    // WuxieChain不需要wuxieTargetCardId 只用来后端校验
    const newHasWuxiePlayers = getAllHasWuxiePlayers(gameStatus);
    gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds = newHasWuxiePlayers.map(u => u.playerId);
    gameStatus.wuxieSimultaneousResStage.wuxieChain.push({
        cards: response.cards,
        actualCard: response.actualCard,
        nextWuXieTargetId: response.originId,
    });
}

exports.generateWuxieSimultaneousResStageByScroll = generateWuxieSimultaneousResStageByScroll;
exports.generateWuxieSimultaneousResStageByPandingCard = generateWuxieSimultaneousResStageByPandingCard;
exports.setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect = setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect;
exports.resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie = resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie;