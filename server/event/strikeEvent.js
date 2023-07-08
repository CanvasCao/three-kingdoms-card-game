const {generateDamageEventThenSetNextDamageEventSkillToSkillResponse} = require("./damageEvent");
const {findNextUnDoneSkillInLastEventTimingsWithSkills} = require("./utils");
const {setEventSkillResponse} = require("./utils");
const {findOnGoingUseStrikeEvent} = require("./utils");
const {throwCards} = require("../utils/cardUtils");
const {findAllEventSkillsByTimingName} = require("./utils");
const {EQUIPMENT_CARDS_CONFIG} = require("../config/cardConfig");
const {CARD_COLOR} = require("../config/cardConfig");
const {getActualCardColor} = require("../utils/cardUtils");
const {USE_EVENT_TIMINGS} = require("../config/eventConfig");
const {last} = require("lodash");
const {getCurrentPlayer, getAllPlayersStartFromFirstLocation} = require("../utils/playerUtils");

const generateUseStrikeEventsThenSetNextStrikeEventSkillToSkillResponse = (gameStatus, {originId, targetIds, cards, actualCard}) => {
    const targetPlayers = getAllPlayersStartFromFirstLocation(gameStatus, getCurrentPlayer(gameStatus).location)
        .filter(p => targetIds.includes(p.playerId))
    const originPlayer = gameStatus.players[originId];

    if (gameStatus.stage.playerId == originPlayer.playerId) {
        originPlayer.shaTimes++;
    }

    gameStatus.useStrikeEvents = targetPlayers.map((targetPlayer) => {
        return {
            originId,
            targetId: targetPlayer.playerId,
            cards,
            actualCard,
            cantShan: false,
            eventTimingsWithSkills: [],
            done: false
        }
    })

    setNextStrikeEventSkillToSkillResponse(gameStatus);
}

const setNextStrikeEventSkillToSkillResponse = (gameStatus) => {
    const useStrikeEvent = findOnGoingUseStrikeEvent(gameStatus)

    if (!useStrikeEvent) {
        return
    }

    const eventTimingsWithSkills = useStrikeEvent.eventTimingsWithSkills;
    const originId = useStrikeEvent.originId
    const targetId = useStrikeEvent.targetId;

    let timingIndex = 0;
    if (eventTimingsWithSkills.length == 0) {
        const eventTimingName = USE_EVENT_TIMINGS[timingIndex]
        const eventTimingSkills = findAllEventSkillsByTimingName(gameStatus, {eventTimingName, originId, targetId})
        eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == USE_EVENT_TIMINGS[timingIndex]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            const eventTimingName = USE_EVENT_TIMINGS[timingIndex + 1]
            const eventTimingSkills = findAllEventSkillsByTimingName(gameStatus, {eventTimingName, originId, targetId})
            eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                setEventSkillResponse(gameStatus, eventTimingSkills[0])
                return;
            }
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == USE_EVENT_TIMINGS[timingIndex + 1]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            setStatusWhenUseStrikeEventDone(gameStatus);
            handleUseStrikeEventEnd(gameStatus);
        }
    }
}

const setStatusWhenUseStrikeEventDone = (gameStatus) => {
    const useStrikeEvent = findOnGoingUseStrikeEvent(gameStatus);
    const originId = useStrikeEvent.originId
    const targetId = useStrikeEvent.targetId;
    const originPlayer = gameStatus.players[originId];
    const targetPlayer = gameStatus.players[targetId];
    const action = gameStatus.action;

    useStrikeEvent.done = true;
    // 杀会取消的情况 仁王盾
    if (getActualCardColor(action.actualCard) == CARD_COLOR.BLACK &&
        targetPlayer.shieldCard?.CN == EQUIPMENT_CARDS_CONFIG.REN_WANG_DUN.CN &&
        originPlayer.weaponCard?.CN != EQUIPMENT_CARDS_CONFIG.QIN_GANG_JIAN.CN) {
    } else if (useStrikeEvent.cantShan) {
        generateDamageEventThenSetNextDamageEventSkillToSkillResponse(gameStatus, {
            damageCards: useStrikeEvent.cards,
            damageActualCard: useStrikeEvent.actualCard, // 渠道
            damageAttribute: useStrikeEvent.actualCard?.attribute,// 属性
            originId,// 来源
            targetId
        })
    } else {
        gameStatus.shanResponse = {
            originId: targetId,
            targetId: originId,
            cardNumber: 1,
        }
    }
}

const handleUseStrikeEventEnd = (gameStatus) => {
    if (gameStatus.useStrikeEvents.every((e) => e.done)) {
        delete gameStatus.useStrikeEvents;
        const action = gameStatus.action;
        throwCards(gameStatus, action.cards);
    } else {
        setNextStrikeEventSkillToSkillResponse(gameStatus)
    }
}

exports.generateUseStrikeEventsThenSetNextStrikeEventSkillToSkillResponse = generateUseStrikeEventsThenSetNextStrikeEventSkillToSkillResponse;
exports.setNextStrikeEventSkillToSkillResponse = setNextStrikeEventSkillToSkillResponse;