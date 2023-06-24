const {executeNextOnePandingCard} = require("../event/pandingEvent");
const {STAGE_NAMES, STAGE_NAME} = require("../config/gameConfig");
const {isNil} = require("lodash");
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
    tryGoToNextPlayOrResponseOrThrowTurn(gameStatus);
}

const tryGoToNextPlayOrResponseOrThrowTurn = (gameStatus) => {
    if (ifAnyPlayerNeedToResponse(gameStatus)) {
        return
    }

    const currentPlayer = getCurrentPlayer(gameStatus);
    if (currentPlayer.isDead) { // 自己的回合死亡后 需要直接移动到下一个人（闪电 决斗）
        goNextPlayerStartStage(gameStatus)
    }

    const currentStageName = STAGE_NAMES[gameStatus.stage.stageIndex]
    if (currentStageName == STAGE_NAME.START) {
        goToNextStage(gameStatus);
    } else if (currentStageName == STAGE_NAME.JUDGE) {
        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus)
        if (!nextNeedPandingSign) {
            goToNextStage(gameStatus);
        } else if (isNil(nextNeedPandingSign.isEffect)) { // 有未生效的判定 需要无懈可击
            const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus)
            if (hasWuxiePlayers.length > 0) {
                generateWuxieSimultaneousResStageByPandingCard(gameStatus)
                emitRefreshStatus(gameStatus);
            } else { // 延时锦囊需要判定
                nextNeedPandingSign.isEffect = true;
                tryGoToNextPlayOrResponseOrThrowTurn(gameStatus); // nextNeedPandingSign生效之后进入 判定执行
            }
        } else { // 被无懈可击 或 开始判定
            executeNextOnePandingCard(gameStatus);
            emitRefreshStatus(gameStatus); // 闪电之后可能要求桃
            tryGoToNextPlayOrResponseOrThrowTurn(gameStatus); // 如果还有别的判定牌会再一次回到这里
        }
    } else if (currentStageName == STAGE_NAME.DRAW) {
        const cards = getCards(gameStatus, 2)
        currentPlayer.addCards(cards)
        emitNotifyDrawCards(gameStatus, cards, currentPlayer)
        goToNextStage(gameStatus);
    } else if (currentStageName == STAGE_NAME.PLAY) {
        if (currentPlayer.skipPlay) {
            goToNextStage(gameStatus);
        }
    } else if (currentStageName == STAGE_NAME.THROW) {
        if (!currentPlayer.needThrow()) {
            goToNextStage(gameStatus);
        }
    } else if (currentStageName == STAGE_NAME.END) {
        goToNextStage(gameStatus);
    }
}

const ifAnyPlayerNeedToResponse = (gameStatus) => {
    if (gameStatus.shanResponse ||
        gameStatus.skillResponse ||
        gameStatus.taoResStages.length > 0 ||
        gameStatus.scrollResStages.length > 0 ||
        gameStatus.weaponResStages.length > 0 ||
        gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds.length > 0
    ) {
        return true
    }
    return false
}

exports.goToNextStage = goToNextStage;
exports.ifAnyPlayerNeedToResponse = ifAnyPlayerNeedToResponse;
exports.tryGoToNextPlayOrResponseOrThrowTurn = tryGoToNextPlayOrResponseOrThrowTurn;