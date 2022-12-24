const {pandingHandler} = require("../handler/pandingHandler");
const {emitRefreshStatus} = require("./utils");
const {getCurrentUser, setCurrentLocationToNextLocation} = require("./userUtils");
const {getCards} = require("./cardUtils");
const {DELAY_SCROLL_CARDS_CONFIG} = require("../initCards")
const stageConfig = require("../config/stageConfig.json")

const goToNextStage = (gameStatus) => {
    gameStatus.stageIndex++;
    if (gameStatus.stageIndex >= stageConfig.stageNamesEN.length) {
        getCurrentUser(gameStatus).resetWhenMyTurnEnds();
        gameStatus.stageIndex = 0;
        setCurrentLocationToNextLocation(gameStatus);
    }
    gameStatus.stage = {
        userId: getCurrentUser(gameStatus).userId,
        stageName: stageConfig.stageNamesEN[gameStatus.stageIndex],
        stageNameCN: stageConfig.stageNamesCN[gameStatus.stageIndex]
    }
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
        pandingHandler.executePanding(gameStatus, goToNextStage, tryGoNextStage);
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
        gameStatus.wuxieResStage.hasWuxiePlayerIds.length > 0
    ) {
        return false
    }
    return true
}

exports.goToNextStage = goToNextStage;
exports.canTryGoNextStage = canTryGoNextStage;
exports.tryGoNextStage = tryGoNextStage;