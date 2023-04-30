const {findAllEventSkillsByTimingName} = require("./utils");
const {EQUIPMENT_CARDS_CONFIG} = require("../config/cardConfig");
const {CARD_COLOR} = require("../config/cardConfig");
const {getActualCardColor} = require("../utils/cardUtils");
const {USE_EVENT_TIMING} = require("../config/eventConfig");
const {last} = require("lodash");

const {
    getCurrentPlayer,
    getAllPlayersStartFromFirstLocation
} = require("../utils/playerUtils");


const generateUseStrikeEvents = (gameStatus, originId, targetIds) => {
    gameStatus.useStrikeEvents = [];
    const targetPlayers = getAllPlayersStartFromFirstLocation(gameStatus, getCurrentPlayer(gameStatus).location)
        .filter(p => targetIds.includes(p.playerId))
    const originPlayer = gameStatus.players[originId]
    if (gameStatus.stage.playerId == originPlayer.playerId) {
        originPlayer.shaTimes++;
    }

    gameStatus.useStrikeEvents = targetPlayers.map((player) => {
        const targetPlayer = gameStatus.players[player.playerId]
        return {
            originId,
            targetId: targetPlayer.playerId,
            timings: [],
            done: false
        }
    })

    findNextSkillToReleaseInStrikeEvent(gameStatus);
}

const findNextSkillToReleaseInStrikeEvent = (gameStatus) => {
    const action = gameStatus.action;
    const useStrikeEvents = gameStatus.useStrikeEvents;
    const useStrikeEvent = useStrikeEvents.find((event) => !event.done)

    if (!useStrikeEvent) {
        return
    }

    const useStrikeEventTimings = useStrikeEvent.timings
    const originId = useStrikeEvent.originId
    const targetId = useStrikeEvent.targetId;
    const originPlayer = gameStatus.players[originId];
    const targetPlayer = gameStatus.players[targetId];
    if (useStrikeEventTimings.length == 0) {
        const name = USE_EVENT_TIMING.WHEN_BECOMING_TARGET
        const eventSkills = findAllEventSkillsByTimingName(gameStatus, {name, originId, targetId})
        useStrikeEvent.timings.push({name, skills: eventSkills})

        if (eventSkills.length > 0) {
            gameStatus.skillResponse = eventSkills[0]
            return;
        }
    }

    if (last(useStrikeEventTimings).name == USE_EVENT_TIMING.WHEN_BECOMING_TARGET) {
        const name = USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET;
        const eventSkills = findAllEventSkillsByTimingName(gameStatus, {name, originId, targetId})
        useStrikeEventTimings.push({name, skills: eventSkills})

        if (eventSkills.length > 0) {
            gameStatus.skillResponse = eventSkills[0]
            return;
        }
    }

    if (last(useStrikeEventTimings).name == USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET) {
        const name = USE_EVENT_TIMING.WHEN_SETTLEMENT_BEGINS
        useStrikeEventTimings.push({name, skills: []})

        // 杀会取消的情况
        // 1. A是黑杀&没有【青釭剑】&& B仁王盾
        if (getActualCardColor(action.actualCard) == CARD_COLOR.BLACK &&
            targetPlayer.shieldCard?.CN == EQUIPMENT_CARDS_CONFIG.REN_WANG_DUN.CN &&
            (originPlayer.weaponCard?.CN != EQUIPMENT_CARDS_CONFIG.QIN_GANG_JIAN.CN)) {
            useStrikeEvent.done = true;
        }

        // 需要出闪
        gameStatus.shanResponse = {
            originId: targetId,
            targetId: originId,
            cardNumber: 1,
        }
        return;
    }
}

exports.generateUseStrikeEvents = generateUseStrikeEvents;