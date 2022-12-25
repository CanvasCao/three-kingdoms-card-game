const {getNextNeedExecutePandingSign} = require("./pandingUtils");
const {DELAY_SCROLL_CARDS_CONFIG} = require("../initCards");
const {getAllHasWuxieUsers, getCurrentUser} = require("./userUtils");
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


const setGameStatusWhenScrollTakeEffect = (gameStatus) => {
    if (gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds.length != 0) {
        throw new Error("还有人出无懈可击 不可以结算锦囊");
    }

    // wuxieChain长度为奇数个 锦囊生效
    const isScrollEffected = gameStatus.wuxieSimultaneousResStage.wuxieChain.length % 2 == 1

    // 延时锦囊
    if (gameStatus.stage.stageName == "judge") {
        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus);
        nextNeedPandingSign.isEffect = isScrollEffected;

        // 延迟锦囊生效后 需要判断是不是从判定阶段到出牌阶段 不能放在这里有循环引用
        // tryGoNextStage(gameStatus);
    }
    // 即时锦囊
    else if (gameStatus.scrollResStages.length > 0) {
        if (isScrollEffected) {// 生效
            if (gameStatus.scrollResStages[0].actualCard.CN == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.CN) {
                getCurrentUser(gameStatus).addCards(getCards(gameStatus, 2));
                clearNextScrollStage(gameStatus);
            } else {
                gameStatus.scrollResStages[0].isEffect = true;
            }
        } else {// 失效
            clearNextScrollStage(gameStatus);
        }
    }
    clearWuxieResStage(gameStatus); // 生效后清空WuxieResStage
}

exports.generateWuxieSimultaneousResStageByScroll = generateWuxieSimultaneousResStageByScroll;
exports.generateWuxieSimultaneousResStageByPandingCard = generateWuxieSimultaneousResStageByPandingCard;
exports.setGameStatusWhenScrollTakeEffect = setGameStatusWhenScrollTakeEffect;