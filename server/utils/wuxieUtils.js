const {getNextNeedExecutePandingSign} = require("./pandingUtils");
const {SCROLL_CARDS_CONFIG} = require("../initCards");
const {getAllHasWuxieUsers, getCurrentUser} = require("./userUtils");
const {getCards} = require("./cardUtils");
const {clearNextScrollStage, clearWuxieResStage} = require("./clearStageUtils");

const generateWuxieSimultaneousResStageByScroll = (gameStatus) => {
    const action = gameStatus.action;
    const hasWuxiePlayers = getAllHasWuxieUsers(gameStatus);
    if (hasWuxiePlayers.length <= 0) {
        throw Error("没有人有无懈可击 不需要生成wuxieSimultaneousResStage")
    }
    gameStatus.wuxieSimultaneousResStage = {
        hasWuxiePlayerIds: hasWuxiePlayers.map((u) => u.userId),
        wuxieChain: [{
            originId: action.originId,
            targetId: action.targetId,
            cards: action.cards,
            actualCard: action.actualCard
        }]
    }
}

const generateWuxieSimultaneousResStageByPandingCard = (gameStatus) => {
    const currentUser = getCurrentUser(gameStatus);
    const nextPandingSign = getNextNeedExecutePandingSign(gameStatus);
    const hasWuxiePlayers = getAllHasWuxieUsers(gameStatus);
    if (hasWuxiePlayers.length <= 0) {
        throw Error("没有人有无懈可击 不需要生成wuxieSimultaneousResStage")
    }
    gameStatus.wuxieSimultaneousResStage = {
        hasWuxiePlayerIds: hasWuxiePlayers.map((u) => u.userId),
        wuxieChain: [{
            originId: currentUser.userId, // 判定的来源和目标都是自己
            targetId: currentUser.userId,
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

    // wuxieChain长度为奇数个 或者直接生效 锦囊生效
    const isScrollEffected = (gameStatus.wuxieSimultaneousResStage.wuxieChain.length % 2 == 1) ||
        gameStatus.wuxieSimultaneousResStage.wuxieChain.length == 0 // 不求无懈直接生效

    // 延时锦囊
    if (gameStatus.stage.stageName == "judge") {
        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus);
        nextNeedPandingSign.isEffect = isScrollEffected;

        // 延迟锦囊生效后 需要判断是不是从判定阶段到出牌阶段 不能放在这里有循环引用
        // tryGoNextStage(gameStatus);
    }
    // 即时锦囊
    else if (gameStatus.scrollResStages.length > 0) {
        const curScrollResStage = gameStatus.scrollResStages[0]
        if (isScrollEffected) {// 生效
            if (curScrollResStage.actualCard.CN == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.CN) {
                getCurrentUser(gameStatus).addCards(getCards(gameStatus, 2));
                clearNextScrollStage(gameStatus);
            } else if (curScrollResStage.actualCard.CN == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.CN) {
                gameStatus.users[curScrollResStage.targetId].addBlood();
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
            }

        } else {// 失效
            clearNextScrollStage(gameStatus);
        }
    }
    clearWuxieResStage(gameStatus); // 生效后清空WuxieResStage

    // 桃园结义很特殊
    // 因为clear scrollResStage之后 不用设置isEffect 直接加血 所以需要递归判断下一个用户
    // 无中生有 只有一个目标 可以递归但是没必要
    if ((gameStatus.scrollResStages.length > 0) && gameStatus.scrollResStages[0].CN == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.CN) {
        const hasWuxiePlayers = getAllHasWuxieUsers(gameStatus)
        if (hasWuxiePlayers.length > 0) {
            generateWuxieSimultaneousResStageByScroll(gameStatus)
        } else { // 没人有无懈可击直接生效
            setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, "TAO_YUAN_JIE_YI");
        }
    }
}

const resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie = (gameStatus, response) => {
    const newHasWuxiePlayers = getAllHasWuxieUsers(gameStatus);
    gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds = newHasWuxiePlayers.map(u => u.userId);
    gameStatus.wuxieSimultaneousResStage.wuxieChain.push({
        cards: response.cards,
        actualCard: response.actualCard,
        originId: response.originId,
        targetId: response.targetId,
        wuxieTargetCardId: response.wuxieTargetCardId,
    });
}

exports.generateWuxieSimultaneousResStageByScroll = generateWuxieSimultaneousResStageByScroll;
exports.generateWuxieSimultaneousResStageByPandingCard = generateWuxieSimultaneousResStageByPandingCard;
exports.setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect = setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect;
exports.resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie = resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie;