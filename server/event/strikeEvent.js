const {setEventSkillResponse} = require("./utils");
const {findOnGoingUseStrikeEvent} = require("./utils");
const {throwCards} = require("../utils/cardUtils");
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
    const originPlayer = gameStatus.players[originId];

    if (gameStatus.stage.playerId == originPlayer.playerId) {
        originPlayer.shaTimes++;
    }

    gameStatus.useStrikeEvents = targetPlayers.map((player) => {
        const targetPlayer = gameStatus.players[player.playerId]
        return {
            originId,
            targetId: targetPlayer.playerId,
            cantShan: false,
            eventTimingWithSkills: [],
            done: false
        }
    })

    findNextSkillToReleaseInStrikeEvent(gameStatus);
}

const findNextSkillToReleaseInStrikeEvent = (gameStatus) => {
    const action = gameStatus.action;
    const useStrikeEvent = findOnGoingUseStrikeEvent(gameStatus)

    if (!useStrikeEvent) {
        return
    }

    const eventTimingWithSkills = useStrikeEvent.eventTimingWithSkills;
    const originId = useStrikeEvent.originId
    const targetId = useStrikeEvent.targetId;
    const originPlayer = gameStatus.players[originId];
    const targetPlayer = gameStatus.players[targetId];
    if (eventTimingWithSkills.length == 0) {
        const eventTimingName = USE_EVENT_TIMING.WHEN_BECOMING_TARGET
        const eventTimingSkills = findAllEventSkillsByTimingName(gameStatus, {eventTimingName, originId, targetId})
        eventTimingWithSkills.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingWithSkills).eventTimingName == USE_EVENT_TIMING.WHEN_BECOMING_TARGET) {
        const unChooseToReleaseSkill = last(eventTimingWithSkills).eventTimingSkills
            .find((eventTimingSkill) => eventTimingSkill.chooseToRelease == undefined)

        if (unChooseToReleaseSkill) {
            setEventSkillResponse(gameStatus, unChooseToReleaseSkill)
            return;
        } else {
            const eventTimingName = USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET
            const eventTimingSkills = findAllEventSkillsByTimingName(gameStatus, {eventTimingName, originId, targetId})
            eventTimingWithSkills.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                setEventSkillResponse(gameStatus, eventTimingSkills[0])
                return;
            }
        }
    }

    if (last(eventTimingWithSkills).eventTimingName == USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET) {
        const unChooseToReleaseSkill = last(eventTimingWithSkills).eventTimingSkills
            .find((eventTimingSkill) => eventTimingSkill.chooseToRelease == undefined)

        if (unChooseToReleaseSkill) {
            setEventSkillResponse(gameStatus, unChooseToReleaseSkill)
            return;
        } else {
            // 杀会取消的情况
            if (getActualCardColor(action.actualCard) == CARD_COLOR.BLACK &&
                targetPlayer.shieldCard?.CN == EQUIPMENT_CARDS_CONFIG.REN_WANG_DUN.CN &&
                originPlayer.weaponCard?.CN != EQUIPMENT_CARDS_CONFIG.QIN_GANG_JIAN.CN) {
            } else if (useStrikeEvent.cantShan) {

            } else {
                gameStatus.shanResponse = {
                    originId: targetId,
                    targetId: originId,
                    cardNumber: 1,
                }
            }
            throwCards(gameStatus, action.cards);
            useStrikeEvent.done = true;
        }
    }
}

exports.generateUseStrikeEvents = generateUseStrikeEvents;