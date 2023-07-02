const {emitRefreshStatus} = require("./emitUtils");
const {setGameStatusByTieSuoTempStorage} = require("./tieSuoUtils");
const {setNextStrikeEventSkillToSkillResponse} = require("../event/strikeEvent");
const {setNextPandingEventSkillToSkillResponse} = require("../event/pandingEvent");
const {ifAnyPlayerNeedToResponse} = require("./stageUtils");

const tryFindNextSkillResponse = (gameStatus) => {
    if (ifAnyPlayerNeedToResponse(gameStatus)) {
        return
    }

    // 响应判定技能后
    if (gameStatus.pandingEvent) {
        setNextPandingEventSkillToSkillResponse(gameStatus)
        if (gameStatus.skillResponse) {
            emitRefreshStatus(gameStatus);
            return;
        }
    }

    if (gameStatus.useStrikeEvents) {
        setNextStrikeEventSkillToSkillResponse(gameStatus)
        if (gameStatus.skillResponse) {
            emitRefreshStatus(gameStatus);
            return;
        }
    }

    // 其他铁锁连环角色受到伤害
    if (gameStatus.tieSuoTempStorage.length) {
        setGameStatusByTieSuoTempStorage(gameStatus);
        if (gameStatus.taoResponses.length) {
            emitRefreshStatus(gameStatus);
            return;
        }
    }

    emitRefreshStatus(gameStatus);
}

exports.tryFindNextSkillResponse = tryFindNextSkillResponse;