const {getCardsFromDeck} = require("../../utils/cardUtils");
const {getAllAlivePlayersStartFromFirstLocation} = require("../../utils/playerUtils");
const {findOnGoingEventSkill} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");

const handleShu004GuanXingResponse = (gameStatus, response) => {
    const {chooseToResponse, cards, originId, skillTargetIds} = response;
    const originPlayer = gameStatus.players[originId];

    const onGoingGameStageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.GAME_STAGE_EVENT);

    if (!chooseToResponse) {
        onGoingGameStageEventSkill.done = true;
        return
    }

    if (onGoingGameStageEventSkill.chooseToReleaseSkill === undefined) {
        onGoingGameStageEventSkill.chooseToReleaseSkill = chooseToResponse
        onGoingGameStageEventSkill.done = true;

        const allAlivePlayers = getAllAlivePlayersStartFromFirstLocation(gameStatus, 0)
        const guanXingCardNumber = allAlivePlayers.length > 5 ? 5 : allAlivePlayers.length
        gameStatus.guanXingBoardResponse = {
            originId: originPlayer.playerId,
            guanXingCards: getCardsFromDeck(gameStatus, process.env.NODE_ENV == 'production' ? guanXingCardNumber : 5)
        }
    } else {
        // 确定要观星了是不能取消的
    }
    delete gameStatus.skillResponse
}

exports.handleShu004GuanXingResponse = handleShu004GuanXingResponse;
