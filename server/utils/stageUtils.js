const {STAGE_NAMES, GAME_STAGE} = require("../config/gameConfig");
const {isNil} = require("lodash");
const {pandingHandler} = require("../handler/pandingHandler");
const {emitRefreshStatus, emitNotifyDrawCards} = require("./emitUtils");
const {getCurrentPlayer, getAllHasWuxiePlayers} = require("./playerUtils");
const {setCurrentLocationToNextLocation} = require("./locationUtils");
const {generateWuxieSimultaneousResStageByPandingCard} = require("./wuxieUtils");
const {clearAllResStages} = require("./clearResStageUtils");
const {getNextNeedExecutePandingSign} = require("./pandingUtils");
const {getCards} = require("./cardUtils");

const setGameStatusStage = (gameStatus) => {
    gameStatus.stage = {
        playerId: getCurrentPlayer(gameStatus).playerId,
        stageIndex: gameStatus.stageIndex,
    }
}

const goNextPlayerStartStage = (gameStatus) => {
    // 当前用户结束
    getCurrentPlayer(gameStatus).resetWhenMyTurnEnds();

    // 下一个用户开始
    gameStatus.stageIndex = 0;
    setCurrentLocationToNextLocation(gameStatus);
    setGameStatusStage(gameStatus);
    getCurrentPlayer(gameStatus).resetWhenMyTurnStarts();
}

const goToNextStage = (gameStatus) => {
    gameStatus.stageIndex++;
    if (gameStatus.stageIndex >= STAGE_NAMES.length) {
        goNextPlayerStartStage(gameStatus)
    } else {
        setGameStatusStage(gameStatus);
    }

    clearAllResStages(gameStatus)

    emitRefreshStatus(gameStatus);
    tryGoNextStage(gameStatus);
}

// const
const tryGoNextStage = (gameStatus) => {
    if (!canTryGoNextStage(gameStatus)) {
        return
    }

    const player = getCurrentPlayer(gameStatus);
    if (player.isDead) { // 自己的回合死亡后 需要直接移动到下一个人（闪电 决斗）
        goNextPlayerStartStage(gameStatus)
    }

    const currentStageName = STAGE_NAMES[gameStatus.stage.stageIndex]
    if (STAGE_NAMES[gameStatus.stage.stageIndex] == GAME_STAGE.START) {
        goToNextStage(gameStatus);
    } else if (currentStageName == GAME_STAGE.JUDGE) {
        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus)
        if (!nextNeedPandingSign) {
            goToNextStage(gameStatus);
        } else if (isNil(nextNeedPandingSign.isEffect)) { // 有未生效的判定 需要无懈可击
            const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus)
            if (hasWuxiePlayers.length > 0) {
                generateWuxieSimultaneousResStageByPandingCard(gameStatus)
                emitRefreshStatus(gameStatus);
            } else {
                nextNeedPandingSign.isEffect = true;
                tryGoNextStage(gameStatus); // nextNeedPandingSign生效之后进入 判定执行
            }
        } else {
            pandingHandler.executeNextOnePanding(gameStatus);
            emitRefreshStatus(gameStatus); // 闪电之后可能要求桃
            tryGoNextStage(gameStatus); // 如果还有别的判定牌会再一次回到这里
        }
    } else if (currentStageName == GAME_STAGE.DRAW) {
        const cards = getCards(gameStatus, 2)
        player.addCards(cards)
        emitNotifyDrawCards(gameStatus, cards, player)
        goToNextStage(gameStatus);
    } else if (currentStageName == GAME_STAGE.PLAY) {
        if (player.skipPlay) {
            goToNextStage(gameStatus);
        }
    } else if (currentStageName == GAME_STAGE.THROW) {
        if (!player.needThrow()) {
            goToNextStage(gameStatus);
        }
    } else if (currentStageName == GAME_STAGE.END) {
        goToNextStage(gameStatus);
    }
}

const canTryGoNextStage = (gameStatus) => {
    if (gameStatus.shanResStages.length > 0 ||
        gameStatus.taoResStages.length > 0 ||
        gameStatus.scrollResStages.length > 0 ||
        gameStatus.weaponResStages.length > 0 ||
        gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds.length > 0
    ) {
        return false
    }
    return true
}

exports.goToNextStage = goToNextStage;
exports.canTryGoNextStage = canTryGoNextStage;
exports.tryGoNextStage = tryGoNextStage;