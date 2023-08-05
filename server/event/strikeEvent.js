const {USE_OR_PLAY_CONFIG} = require("../config/eventConfig");
const {CARD_CONFIG} = require("../config/cardConfig");
const {generateResponseCardEventThenSetNextResponseCardEventSkill} = require("./responseCardEvent");
const {findOnGoingEvent} = require("./utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../config/eventConfig");
const {generateDamageEventThenSetNextDamageEventSkill} = require("./damageEvent");
const {findNextUnDoneSkillInLastEventTimingsWithSkills} = require("./utils");
const {setEventSkillResponse} = require("./utils");
const {findAllEventSkillsByTimingNameAndActionCard} = require("./utils");
const {EQUIPMENT_CARDS_CONFIG} = require("../config/cardConfig");
const {CARD_COLOR} = require("../config/cardConfig");
const {getActualCardColor} = require("../utils/cardUtils");
const {USE_EVENT_TIMINGS} = require("../config/eventConfig");
const {last} = require("lodash");
const {getCurrentPlayer, getAllAlivePlayersStartFromFirstLocation} = require("../utils/playerUtils");

const generateUseStrikeEventsThenSetNextStrikeEventSkill = (gameStatus, {originId, targetIds, cards, actualCard}) => {
    const targetPlayers = getAllAlivePlayersStartFromFirstLocation(gameStatus, getCurrentPlayer(gameStatus).location)
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

    setNextStrikeEventSkill(gameStatus);
}

const setNextStrikeEventSkill = (gameStatus) => {
    const useStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS)

    if (!useStrikeEvent) {
        return
    }

    const {eventTimingsWithSkills, originId, targetId, actualCard} = useStrikeEvent;
    const actionCardKey = actualCard?.key;
    let timingIndex = 0;
    if (eventTimingsWithSkills.length == 0) {
        const eventTimingName = USE_EVENT_TIMINGS[timingIndex]
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, actionCardKey, originId, targetId})
        eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == USE_EVENT_TIMINGS[timingIndex]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            const eventTimingName = USE_EVENT_TIMINGS[timingIndex + 1]
            const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, actionCardKey, originId, targetId})
            eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                setEventSkillResponse(gameStatus, eventTimingSkills[0])
                return;
            }
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == USE_EVENT_TIMINGS[timingIndex + 1]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
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
    const useStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
    const originId = useStrikeEvent.originId
    const targetId = useStrikeEvent.targetId;
    const originPlayer = gameStatus.players[useStrikeEvent.originId];
    const targetPlayer = gameStatus.players[useStrikeEvent.targetId];
    const action = gameStatus.action;

    useStrikeEvent.done = true;
    // 杀会取消的情况 无QIN_GANG_JIAN&&黑杀&&仁王盾
    if (getActualCardColor(action.actualCard) == CARD_COLOR.BLACK &&
        targetPlayer.shieldCard?.key == EQUIPMENT_CARDS_CONFIG.REN_WANG_DUN.key &&
        originPlayer.weaponCard?.key != EQUIPMENT_CARDS_CONFIG.QIN_GANG_JIAN.key) {
    } else if (useStrikeEvent.cantShan) {
        generateDamageEventThenSetNextDamageEventSkill(gameStatus, {
            damageCards: useStrikeEvent.cards,
            damageActualCard: useStrikeEvent.actualCard, // 渠道
            damageAttribute: useStrikeEvent.actualCard?.attribute,// 属性
            originId,// 来源
            targetId
        })
    } else {
        generateResponseCardEventThenSetNextResponseCardEventSkill(gameStatus, {
            originId: useStrikeEvent.targetId,
            targetId: useStrikeEvent.originId,
            actionCardKey: gameStatus.action?.actualCard?.key,
            responseCardKeys: [CARD_CONFIG.SHAN.key],
            useOrPlay: USE_OR_PLAY_CONFIG.USE
        })
    }
}

const handleUseStrikeEventEnd = (gameStatus) => {
    if (gameStatus.useStrikeEvents.every((e) => e.done)) {
        delete gameStatus.useStrikeEvents;
    } else {
        setNextStrikeEventSkill(gameStatus)
    }
}

exports.generateUseStrikeEventsThenSetNextStrikeEventSkill = generateUseStrikeEventsThenSetNextStrikeEventSkill;
exports.setNextStrikeEventSkill = setNextStrikeEventSkill;