const {getNextNeedExecutePandingSign} = require("./pandingUtils");
const {DELAY_SCROLL_CARDS_CONFIG} = require("../initCards");
const {getAllHasWuxieUsers, getCurrentUser} = require("./userUtils");

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


exports.generateWuxieSimultaneousResStageByScroll = generateWuxieSimultaneousResStageByScroll;
exports.generateWuxieSimultaneousResStageByPandingCard = generateWuxieSimultaneousResStageByPandingCard;