const {isNil} = require("lodash");
const {pandingHandler} = require("../handler/pandingHandler");
const {emitRefreshStatus} = require("./emitUtils");
const {getCurrentPlayer, getAllHasWuxiePlayers} = require("./playerUtils");
const {setCurrentLocationToNextLocation} = require("./locationUtils");
const {generateWuxieSimultaneousResStageByPandingCard} = require("./wuxieUtils");
const {clearWuxieResStage} = require("./clearStageUtils");
const {getNextNeedExecutePandingSign} = require("./pandingUtils");
const {getCards} = require("./cardUtils");
const stageConfig = require("../config/stageConfig.json")
const emitMap = require("../config/emitMap.json");

const goToNextStage = (gameStatus) => {
    gameStatus.stageIndex++;
    if (gameStatus.stageIndex >= stageConfig.stageNamesEN.length) {
        // 当前用户结束
        getCurrentPlayer(gameStatus).resetWhenMyTurnEnds();

        // 下一个用户开始
        gameStatus.stageIndex = 0;
        setCurrentLocationToNextLocation(gameStatus);
        getCurrentPlayer(gameStatus).resetWhenMyTurnStarts();
    }
    gameStatus.stage = {
        playerId: getCurrentPlayer(gameStatus).playerId,
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

    const player = getCurrentPlayer(gameStatus);
    if (gameStatus.stage.stageName == 'start') {
        goToNextStage(gameStatus);
    } else if (gameStatus.stage.stageName == 'judge') {
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
                tryGoNextStage(gameStatus);// nextNeedPandingSign生效之后进入 判定执行
            }
        } else {
            pandingHandler.executeNextOnePanding(gameStatus);
            emitRefreshStatus(gameStatus); // 闪电之后可能要求桃
            tryGoNextStage(gameStatus);// 如果还有别的判定牌会再一次回到这里
        }
    } else if (gameStatus.stage.stageName == 'draw') {


        const cards=getCards(gameStatus, 2)
        player.addCards(cards)
        // TODO NOTIFY_ADD_OWNER_CHANGE_CARD统一封装在addCards
        gameStatus.io.emit(emitMap.NOTIFY_ADD_OWNER_CHANGE_CARD, {
            cards,
            fromId:'牌堆',
            toId: player.playerId,
        });

        goToNextStage(gameStatus);
    } else if (gameStatus.stage.stageName == 'play') {
        if (player.skipPlay) {
            goToNextStage(gameStatus);
        }
    } else if (gameStatus.stage.stageName == 'throw') {
        if (!player.needThrow()) {
            goToNextStage(gameStatus);
        }
    } else if (gameStatus.stage.stageName == 'end') {
        goToNextStage(gameStatus);
    }
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