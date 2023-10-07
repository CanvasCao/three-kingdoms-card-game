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
    const eventTimingTracker = gameStatus.gameStageEvent.eventTimingTracker;
    const lastEventTimingName = last(eventTimingTracker)?.eventTimingName;
    const index = GAME_STAGE_TIMINGS.findIndex((t) => t == lastEventTimingName);

    clearAllResponses(gameStatus)

    if (!eventTimingTracker.length) {
        const nextEventTimingName = GAME_STAGE_TIMINGS[0]
        eventTimingTracker.push({eventTimingName: nextEventTimingName, eventTimingSkills: []})
        trySetNextGameStageEventSkill(gameStatus);
    } else if (index == GAME_STAGE_TIMINGS.length - 1) {
        handleGameStageEventEnd(gameStatus)
    } else {
        // 如果有没有处理的事件
        if (findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingTracker)) {
            last(eventTimingTracker).eventTimingSkills.forEach((skill) => skill.done = true);

            // 点击goToNextStage的时候 让XU_CHU摸牌
            if (last(eventTimingTracker).eventTimingName === GAME_STAGE_TIMING.GAME_STAGE_IS_DRAWING) {
                getCurrentPlayer(gameStatus).drawCards(gameStatus)
            }
        } else {
            const nextEventTimingName = GAME_STAGE_TIMINGS[index + 1]
            eventTimingTracker.push({eventTimingName: nextEventTimingName, eventTimingSkills: []})
        }
        trySetNextGameStageEventSkill(gameStatus);
    }
}

const generateGameStageEventThenSetNextGameStageEventSkill = (gameStatus) => {
    gameStatus.gameStageEvent = {eventTimingTracker: []}
    trySetNextGameStageEventSkill(gameStatus);
}

const trySetNextGameStageEventSkill = (gameStatus, from) => {
    if (ifAnyPlayerNeedToResponse(gameStatus)) {
        return
    }

    const currentPlayer = getCurrentPlayer(gameStatus);
    if (getCurrentPlayer(gameStatus).isDead) { // 自己的回合死亡后 需要直接移动到下一个人（闪电 决斗）
        handleGameStageEventEnd(gameStatus)
    }

    const {gameStageEvent, stage} = gameStatus;
    const eventTimingTracker = gameStageEvent.eventTimingTracker;
    const originId = currentPlayer.playerId

    if (eventTimingTracker.length == 0) {
        stage.setStageName(STAGE_NAME.JUDGE);
        const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_IS_JUDGING

        let nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus)
        if (nextNeedPandingSign) {
            while (nextNeedPandingSign) {
                if (isNil(nextNeedPandingSign.isEffect)) {
                    const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus)
                    if (hasWuxiePlayers.length > 0) {
                        generateWuxieSimultaneousResponseByPandingCard(gameStatus)
                        return;
                    } else { // 没有无懈可击 延时锦囊直接生效
                        nextNeedPandingSign.isEffect = true;
                    }
                }

                executeNextOnePandingCard(gameStatus);
                if (ifAnyPlayerNeedToResponse(gameStatus)) {
                    return;
                }
                nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus)
            }

            // while 中间没有break 说明判定自动结束
            eventTimingTracker.push({eventTimingName, eventTimingSkills: []})
        } else {
            eventTimingTracker.push({eventTimingName, eventTimingSkills: []})
        }
    }

    if (last(eventTimingTracker)?.eventTimingName == GAME_STAGE_TIMING.GAME_STAGE_IS_JUDGING) {
        const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_WHEN_DRAW_START //【突袭】
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, originId})
        eventTimingTracker.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingTracker)?.eventTimingName == GAME_STAGE_TIMING.GAME_STAGE_WHEN_DRAW_START) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingTracker)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            stage.setStageName(STAGE_NAME.DRAW);
            const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_IS_DRAWING

            if (currentPlayer.skipTimimg[GAME_STAGE_TIMING.GAME_STAGE_IS_DRAWING]) { // 因为突袭skipTimimg
                eventTimingTracker.push({eventTimingName, eventTimingSkills: []})
            } else {
                const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, originId})
                eventTimingTracker.push({eventTimingName, eventTimingSkills})

                if (eventTimingSkills.length > 0) {
                    setEventSkillResponse(gameStatus, eventTimingSkills[0])
                    return;
                } else {
                    currentPlayer.drawCards(gameStatus)
                }
            }
        }
    }

    if (last(eventTimingTracker)?.eventTimingName == GAME_STAGE_TIMING.GAME_STAGE_IS_DRAWING) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingTracker)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            stage.setStageName(STAGE_NAME.PLAY);
            if (currentPlayer.skipStage[STAGE_NAME.PLAY]) {
                const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_IS_PLAYING
                eventTimingTracker.push({eventTimingName, eventTimingSkills: []})
            } else {
                // 等待前端出牌结束时插入
            }
        }
    }

    if (last(eventTimingTracker)?.eventTimingName == GAME_STAGE_TIMING.GAME_STAGE_IS_PLAYING) {
        const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_BETWEEN_PLAY_AND_THROW //【克己】
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, originId})
        eventTimingTracker.push({eventTimingName, eventTimingSkills})
        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingTracker)?.eventTimingName == GAME_STAGE_TIMING.GAME_STAGE_BETWEEN_PLAY_AND_THROW) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingTracker)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            stage.setStageName(STAGE_NAME.THROW);
            if (!currentPlayer.needThrow()) {
                const eventTimingName = GAME_STAGE_TIMING.GAME_STAGE_IS_THROWING
                eventTimingTracker.push({eventTimingName, eventTimingSkills: []})
            } else {
                // 等待前端弃牌结束时插入
            }
        }
    }

    if (last(eventTimingTracker)?.eventTimingName == GAME_STAGE_TIMING.GAME_STAGE_IS_THROWING) {
        handleGameStageEventEnd(gameStatus);
    }
}

const handleGameStageEventEnd = (gameStatus) => {
    const {stage} = gameStatus;
    getCurrentPlayer(gameStatus).resetWhenMyTurnEnds()
    stage.setCurrentLocationToNextLocation(gameStatus.players);
    getCurrentPlayer(gameStatus).resetWhenMyTurnStarts();

    generateGameStageEventThenSetNextGameStageEventSkill(gameStatus);
}

exports.goToNextStage = goToNextStage;
exports.generateGameStageEventThenSetNextGameStageEventSkill = generateGameStageEventThenSetNextGameStageEventSkill;
exports.trySetNextGameStageEventSkill = trySetNextGameStageEventSkill;
