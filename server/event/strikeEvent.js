const {EQUIPMENT_CARDS_CONFIG} = require("../config/cardConfig");
const {CARD_COLOR} = require("../config/cardConfig");
const {getActualCardColor} = require("../utils/cardUtils");
const {USE_EVENT_TIMINGS} = require("../config/eventConfig");
const {USE_EVENT_TIMING} = require("../config/eventConfig");
const {last} = require("lodash");

const {
    getCurrentPlayer,
    getAllPlayersStartFromFirstLocation
} = require("../utils/playerUtils");

const generateSkill = (playerId) => {
    return {
        playerId,
        chooseToRelease: undefined,
    }
}

const generateStrikeEventTemplate = (originId, targetId) => {
    // const timings = USE_EVENT_TIMINGS.map((timingName) => {
    //     return {name: timingName, skills: []}
    // })
    return {
        originId,
        targetId,
        timings: [],
        done: false
    }
}

// hardcode杀
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
        return generateStrikeEventTemplate(originPlayer.playerId, targetPlayer.playerId)
    })

    findNextSkillToReleaseInStrikeEvent(gameStatus);
}

const findNextSkillToReleaseInStrikeEvent = (gameStatus) => {
    const action = gameStatus.action;
    const useStrikeEvents = gameStatus.useStrikeEvents;
    const useStrikeEvent = useStrikeEvents.find((event) => !event.done)

    // 如果所有事件全部结束了 删除这个事件
    if (!useStrikeEvent) {
        delete gameStatus.useStrikeEvents
        return
    }

    const originId = useStrikeEvent.originId
    const targetId = useStrikeEvent.targetId;
    const originPlayer = gameStatus.players[originId];
    const targetPlayer = gameStatus.players[targetId];
    if (useStrikeEvent.timings.length == 0) {
        console.log(1)

        const name = USE_EVENT_TIMING.WHEN_BECOMING_TARGET
        const skills = findAllSkillsByTimingName(gameStatus, {name, originId, targetId})

        useStrikeEvent.timings.push({name, skills})

        if (skills.length > 0) {
            gameStatus.skillRes = {}
            return;
        }
    }

    if (last(useStrikeEvent.timings).name == USE_EVENT_TIMING.WHEN_BECOMING_TARGET) {
        console.log(2)

        const name = USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET
        const skills = findAllSkillsByTimingName(gameStatus, {name, originId, targetId})

        useStrikeEvent.timings.push({name, skills})

        if (skills.length > 0) {
            gameStatus.skillRes = {}
            return;
        }
    }

    if (last(useStrikeEvent.timings).name == USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET) {
        console.log(3)
        const name = USE_EVENT_TIMING.WHEN_SETTLEMENT_BEGINS
        useStrikeEvent.timings.push({name, skills: []})
        const cardColor = getActualCardColor(action.actualCard);

        // 杀会取消的情况
        // 1. A是黑杀&没有【青釭剑】&& B仁王盾
        if (cardColor == CARD_COLOR.BLACK &&
            targetPlayer.shieldCard?.CN == EQUIPMENT_CARDS_CONFIG.REN_WANG_DUN.CN &&
            (originPlayer.weaponCard?.CN != EQUIPMENT_CARDS_CONFIG.QIN_GANG_JIAN.CN)) {
            useStrikeEvent.done = true;
            findNextSkillToReleaseInStrikeEvent(gameStatus)
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

const findAllSkillsByTimingName = (gameStatus, {name, originId, targetId}) => {
    return []
}

exports.generateUseStrikeEvents = generateUseStrikeEvents;