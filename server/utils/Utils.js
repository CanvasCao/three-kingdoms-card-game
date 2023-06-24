const {setGameStatusByTieSuoTempStorage} = require("./tieSuoUtils");
const {setNextStrikeEventSkillToSkillResponse} = require("../event/strikeEvent");
const {setNextPandingEventSkillToSkillResponse} = require("../event/pandingEvent");
const {tryGoToNextPlayOrResponseOrThrowTurn} = require("./stageUtils");
const {ifAnyPlayerNeedToResponse} = require("./stageUtils");
const tryGoToNextStageOrFindNextSkillResponseAfterAnyResponse = (gameStatus) => {

    if (ifAnyPlayerNeedToResponse(gameStatus)) {
        return
    }

    // 响应判定技能后
    if (gameStatus.pandingEvent) {
        setNextPandingEventSkillToSkillResponse(gameStatus)
        if (gameStatus.skillResponse) {
            return;
        }
    }

    if (gameStatus.useStrikeEvents) {
        setNextStrikeEventSkillToSkillResponse(gameStatus)
        if (gameStatus.skillResponse) {
            return;
        }
    }

    // 其他铁锁连环角色受到伤害
    if (gameStatus.tieSuoTempStorage.length) {
        setGameStatusByTieSuoTempStorage(gameStatus);
        if (gameStatus.taoResStages.length) {
            return;
        }
    }

    // 打无懈可击延迟锦囊生效后 需要判断是不是从判定阶段到出牌阶段
    // 闪电求桃之后 需要判断是不是从判定阶段到出牌阶段
    tryGoToNextPlayOrResponseOrThrowTurn(gameStatus)
}

exports.tryGoToNextStageOrFindNextSkillResponseAfterAnyResponse = tryGoToNextStageOrFindNextSkillResponseAfterAnyResponse;