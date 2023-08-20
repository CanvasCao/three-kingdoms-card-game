const {GAME_STAGE_TIMING} = require("../../config/eventConfig");
const {SKILL_CONFIG} = require("../../config/skillsConfig");
const {findOnGoingEventSkill} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");
const {emitNotifyAddLines} = require("../../utils/emitUtils");
const {getCurrentPlayer} = require("../../utils/playerUtils");

const handleWei004TuXiResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const onGoingGameStageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.GAME_STAGE_EVENT);

    if (!chooseToReleaseSkill) {
        onGoingGameStageEventSkill.done = true;
        return
    }

    if (onGoingGameStageEventSkill.chooseToReleaseSkill === undefined) {
        onGoingGameStageEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
        getCurrentPlayer(gameStatus)[`skip${GAME_STAGE_TIMING.GAME_STAGE_IS_DRAWING}`] = true;
    } else {
        emitNotifyAddLines(gameStatus, {
            fromId: response.originId,
            toIds: response.skillTargetIds
        });

        onGoingGameStageEventSkill.releaseTargetIds = response.skillTargetIds
        onGoingGameStageEventSkill.done = true;

        gameStatus.cardBoardResponses = response.skillTargetIds.map((targetId) => {
            return {
                originId: response.originId,
                targetId,
                cardBoardContentKey: SKILL_CONFIG.WEI004_TU_XI.key
            }
        })
        delete gameStatus.skillResponse
    }
}


exports.handleWei004TuXiResponse = handleWei004TuXiResponse;
