const {isNil} = require("lodash");
const {pandingHandler} = require("../handler/pandingHandler");
const {emitRefreshStatus} = require("./emitUtils");
const {getCurrentUser, getAllHasWuxieUsers} = require("./userUtils");
const {setCurrentLocationToNextLocation} = require("./locationUtils");
const {generateWuxieSimultaneousResStageByPandingCard} = require("./wuxieUtils");
const {clearWuxieResStage} = require("./clearStageUtils");
const {getNextNeedExecutePandingSign} = require("./pandingUtils");
const {getCards} = require("./cardUtils");
const stageConfig = require("../config/stageConfig.json")

const goToNextStage = (gameStatus) => {
    gameStatus.stageIndex++;
    if (gameStatus.stageIndex >= stageConfig.stageNamesEN.length) {
        // 当前用户结束
        getCurrentUser(gameStatus).resetWhenMyTurnEnds();

        // 下一个用户开始
        gameStatus.stageIndex = 0;
        setCurrentLocationToNextLocation(gameStatus);
        getCurrentUser(gameStatus).resetWhenMyTurnStarts();
    }
    gameStatus.stage = {
        userId: getCurrentUser(gameStatus).userId,
        stageName: stageConfig.stageNamesEN[gameStatus.stageIndex],
        stageNameCN: stageConfig.stageNamesCN[gameStatus.stageIndex]
    }

    clearWuxieResStage(gameStatus);
    gameStatus.shanResStages = [];
    gameStatus.taoResStages = [];
    gameStatus.scrollResStages = [];

    emitRefreshStatus(gameStatus);
    tryGoNextStage(gameStatus);
}

const tryGoNextStage = (gameStatus) => {
    if (!canTryGoNextStage(gameStatus)) {
        return
    }

    const user = getCurrentUser(gameStatus);
    if (gameStatus.stage.stageName == 'start') {
        goToNextStage(gameStatus);
    } else if (gameStatus.stage.stageName == 'judge') {
        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus)
        if (!nextNeedPandingSign) {
            goToNextStage(gameStatus);
        } else if (isNil(nextNeedPandingSign.isEffect)) { // 有未生效的判定 需要无懈可击
            const hasWuxiePlayers = getAllHasWuxieUsers(gameStatus)
            if (hasWuxiePlayers.length > 0) {
                generateWuxieSimultaneousResStageByPandingCard(gameStatus)
            } else {
                nextNeedPandingSign.isEffect = true;
                tryGoNextStage(gameStatus);// nextNeedPandingSign生效之后进入 判定执行
            }
        } else {
            pandingHandler.executeNextOnePanding(gameStatus);
            tryGoNextStage(gameStatus);// 如果还有别的判定牌会再一次回到这里
        }
    } else if (gameStatus.stage.stageName == 'draw') {
        user.addCards(getCards(gameStatus, 2))
        goToNextStage(gameStatus);
    } else if (gameStatus.stage.stageName == 'play') {
        if (user.skipPlay) {
            goToNextStage(gameStatus);
        }
    } else if (gameStatus.stage.stageName == 'throw') {
        if (!user.needThrow()) {
            goToNextStage(gameStatus);
        }
    } else if (gameStatus.stage.stageName == 'end') {
        goToNextStage(gameStatus);
    }
    emitRefreshStatus(gameStatus)
}

const canTryGoNextStage = (gameStatus) => {
    if (gameStatus.shanResStages.length > 0 ||
        gameStatus.taoResStages.length > 0 ||
        gameStatus.scrollResStages.length > 0 ||
        gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds.length > 0
    ) {
        return false
    }
    return true
}

exports.goToNextStage = goToNextStage;
exports.canTryGoNextStage = canTryGoNextStage;
exports.tryGoNextStage = tryGoNextStage;