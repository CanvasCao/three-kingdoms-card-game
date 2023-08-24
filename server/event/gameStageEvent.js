const {STAGE_NAME} = require("../config/gameAndStageConfig");
const {GAME_STAGE_TIMINGS} = require("../config/eventConfig");
const {ifAnyPlayerNeedToResponse} = require("../utils/responseUtils");
const {setCurrentLocationToNextLocation} = require("../utils/locationUtils");
const {getCurrentPlayer} = require("../utils/playerUtils");
const {clearAllResponses} = require("../utils/responseUtils");
const {isNil} = require("lodash/lang");
const {executeNextOnePandingCard} = require("./pandingEvent");
const {generateWuxieSimultaneousResponseByPandingCard} = require("../utils/wuxieUtils");
const {getAllHasWuxiePlayers} = require("../utils/playerUtils");
const {getNextNeedExecutePandingSign} = require("../utils/pandingUtils");
const {GAME_STAGE_TIMING} = require("../config/eventConfig");
const {findNextUnDoneSkillInLastEventTimingsWithSkills} = require("./utils");
const {setEventSkillResponse} = require("./utils");
const {findAllEventSkillsByTimingNameAndActionCard} = require("./utils");
const {last} = require("lodash");

// only debug
const goToNextStage = (gameStatus) => {
    const eventTimingsWithSkills = gameStatus.gameStageEvent.eventTimingsWithSkills;
    const lastEventTimingName = last(eventTimingsWithSkills).eventTimingName;
    const index = GAME_STAGE_TIMINGS.findIndex((t) => t == lastEventTimingName);

    clearAllResponses(gameStatus)
    if (index == GAME_STAGE_TIMINGS.length - 1) {
        handleGameStageEventEnd(gameStatus)
    } else {
        // 如果有没有处理的事件
        if (findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)) {
            last(eventTimingsWithSkills).eventTimingSkills.forEach((skill) => skill.done = true)
        } else {
            const nextEventTimingName = GAME_STAGE_TIMINGS[index + 1]
            eventTimingsWithSkills.push({eventTimingName: nextEventTimingName, eventTimingSkills: []})
        }
        trySetNextGameStageEventSkill(gameStatus);
    }

}

const generateGameStageEventThenSetNextGameStageEventSkill = (gameStatus) => {
    gameStatus.stage = {playerId: getCurrentPlayer(gameStatus).playerId, stageIndex: 0}
    gameStatus.gameStageEvent = {eventTimingsWithSkills: []}
    trySetNextGameStageEventSkill(gameStatus);
}

const trySetNextGameStageEventSkill = (gameStatus, from) => {
    if (ifAnyPlayerNeedToResponse(gameStatus)) {
        return
    }

    const currentPlayer = getCurrentPlayer(gameStatus);
    if (currentPlayer.isDead) { // 自己的回合死亡后 需要直接移动到下一个人（闪电 决斗）
        handleGameStageEventEnd(gameStatus)
    }

    const gameStageEvent = gameStatus.gameStageEvent;
    const eventTimingsWithSkills = gameStageEvent.eventTimingsWithSkills;
    const originId = currentPlayer.playerId

    if (eventTimingsWithSkills.length == 0) {
        gameStatus.stage.stageIndex = 1

        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus)
        if (!nextNeedPandingSign) { // 3 没有延时锦囊
        } else if (isNil(nextNeedPandingSign.isEffect)) { // 1 有未生效的判定 需要无懈可击
            const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus)
            if (hasWuxiePlayers.length > 0) {
                generateWuxieSimultaneousResponseByPandingCard(gameStatus)
                return;
            } else { // 没有无懈可击 延时锦囊直接生效
                nextNeedPandingSign.isEffect = true;
                executeNextOnePandingCard(gameStatus);
            }
        } else { // 2 延时锦囊生效或失效了 需要执行结算
            executeNextOnePandingCard(gameStatus);
        }

        if (ifAnyPlayerNeedToResponse(gameStatus)) {
            return
        } else {
            const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_IS_JUDGING
            eventTimingsWithSkills.push({eventTimingName, eventTimingSkills: []})
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == GAME_STAGE_TIMING.GAME_STAGE_IS_JUDGING) {
        const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_WHEN_DRAW_START //【突袭】
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, originId})
        eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == GAME_STAGE_TIMING.GAME_STAGE_WHEN_DRAW_START) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            gameStatus.stage.stageIndex = 2
            const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_IS_DRAWING
            eventTimingsWithSkills.push({eventTimingName, eventTimingSkills: []})

            if (!currentPlayer.skipTimimg[GAME_STAGE_TIMING.GAME_STAGE_IS_DRAWING]) { // 突袭
                currentPlayer.drawCards(gameStatus)
            }
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == GAME_STAGE_TIMING.GAME_STAGE_IS_DRAWING) {
        gameStatus.stage.stageIndex = 3
        if (currentPlayer.skipStage[STAGE_NAME.PLAY]) {
            const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_IS_PLAYING
            eventTimingsWithSkills.push({eventTimingName, eventTimingSkills: []})
        } else {
            // 等待前端出牌结束时插入
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == GAME_STAGE_TIMING.GAME_STAGE_IS_PLAYING) {
        const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_BETWEEN_PLAY_AND_THROW //【克己】
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, originId})
        eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})
        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == GAME_STAGE_TIMING.GAME_STAGE_BETWEEN_PLAY_AND_THROW) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            gameStatus.stage.stageIndex = 4
            if (!currentPlayer.needThrow()) {
                const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_IS_THROWING
                eventTimingsWithSkills.push({eventTimingName, eventTimingSkills: []})
            } else {
                // 等待前端弃牌结束时插入
            }
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == GAME_STAGE_TIMING.GAME_STAGE_IS_THROWING) {
        handleGameStageEventEnd(gameStatus);
    }
}

const handleGameStageEventEnd = (gameStatus) => {
    getCurrentPlayer(gameStatus).resetWhenMyTurnEnds()
    setCurrentLocationToNextLocation(gameStatus)
    getCurrentPlayer(gameStatus).resetWhenMyTurnStarts();

    generateGameStageEventThenSetNextGameStageEventSkill(gameStatus);
}

exports.goToNextStage = goToNextStage;
exports.generateGameStageEventThenSetNextGameStageEventSkill = generateGameStageEventThenSetNextGameStageEventSkill;
exports.trySetNextGameStageEventSkill = trySetNextGameStageEventSkill;
