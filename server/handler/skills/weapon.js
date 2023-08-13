const {EQUIPMENT_CARDS_CONFIG} = require("../../config/cardConfig");
const {generateDamageEventThenSetNextDamageEventSkill} = require("../../event/damageEvent");
const {findOnGoingEvent} = require("../../event/utils");
const {findOnGoingEventSkill} = require("../../event/utils");
const {ALL_EVENTS_KEY_CONFIG} = require("../../config/eventConfig");
const {throwCards} = require("../../utils/cardUtils")

const handleCiXiongShuangGuJianResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];

    const onGoingUseStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
    const onGoingUseStrikeEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);

    if (!chooseToReleaseSkill) {
        if (onGoingUseStrikeEventSkill.chooseToReleaseSkill === undefined) {
            // 放弃CiXiongShuangGuJian
        } else {
            // 不弃牌伤害来源摸一张
            gameStatus.players[onGoingUseStrikeEvent.originId].drawCards(gameStatus, 1)
        }
        onGoingUseStrikeEventSkill.done = true;
        return
    }

    if (onGoingUseStrikeEventSkill.chooseToReleaseSkill === undefined) {
        onGoingUseStrikeEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
        gameStatus.skillResponse.playerId = onGoingUseStrikeEvent.targetId;// 修改技能使用人的目标
    } else {
        originPlayer.removeCards(response.cards);
        throwCards(gameStatus, response.cards);

        onGoingUseStrikeEventSkill.releaseCards = response.cards
        onGoingUseStrikeEventSkill.done = true;

        delete gameStatus.skillResponse
    }
}

const handleQiLinGongResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const onGoingDamageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENT);
    const onGoingDamageEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENT);

    if (!chooseToReleaseSkill) {
        onGoingDamageEventSkill.done = true;
        return
    }

    if (onGoingDamageEventSkill.chooseToReleaseSkill === undefined) {
        onGoingDamageEventSkill.chooseToReleaseSkill = chooseToReleaseSkill

        gameStatus.cardBoardResponses = [{
            originId: onGoingDamageEvent.originId,
            targetId: onGoingDamageEvent.targetId,
            cardBoardContentKey: EQUIPMENT_CARDS_CONFIG.QI_LIN_GONG.key
        }]
    } else {
        // 在CardBoard
        // onGoingDamageEventSkill.done = true;
        // 不能删除 gameStatus.skillResponse
    }
}

const handleGuanShiFuResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];
    const onGoingUseStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
    const onGoingUseStrikeEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);

    if (!chooseToReleaseSkill) {
        onGoingUseStrikeEventSkill.done = true;
        return
    }

    if (onGoingUseStrikeEventSkill.chooseToReleaseSkill === undefined) {
        onGoingUseStrikeEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
    } else {
        originPlayer.removeCards(response.cards);
        throwCards(gameStatus, response.cards);

        onGoingUseStrikeEventSkill.done = true;
        delete gameStatus.skillResponse;

        generateDamageEventThenSetNextDamageEventSkill(gameStatus, {
            damageCards: onGoingUseStrikeEvent.cards,
            damageActualCard: onGoingUseStrikeEvent.actualCard, // 渠道
            damageAttribute: onGoingUseStrikeEvent.actualCard?.attribute,// 属性
            originId: onGoingUseStrikeEvent.originId,// 来源
            targetId: onGoingUseStrikeEvent.targetId,
        })
    }
}

const handleQingLongYanYueDaoResponse = (gameStatus, response) => {
    const chooseToReleaseSkill = response.chooseToResponse;
    const originPlayer = gameStatus.players[response.originId];
    const onGoingUseStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
    const onGoingUseStrikeEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);

    if (!chooseToReleaseSkill) {
        onGoingUseStrikeEventSkill.done = true;
        return
    }

    if (onGoingUseStrikeEventSkill.chooseToReleaseSkill === undefined) {
        onGoingUseStrikeEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
    } else {
        originPlayer.removeCards(response.cards);
        throwCards(gameStatus, response.cards);

        onGoingUseStrikeEventSkill.done = true;
        delete gameStatus.skillResponse;

        // onGoingUseStrikeEvent 阶段重置
        onGoingUseStrikeEvent.dodgeStatus = undefined;
        onGoingUseStrikeEvent.eventTimingsWithSkills = [onGoingUseStrikeEvent.eventTimingsWithSkills[0]]; // 只保留第一个元素
        onGoingUseStrikeEvent.cards = response.cards;
        onGoingUseStrikeEvent.actualCard = response.actualCard;
    }
}

exports.handleCiXiongShuangGuJianResponse = handleCiXiongShuangGuJianResponse;
exports.handleQiLinGongResponse = handleQiLinGongResponse;
exports.handleGuanShiFuResponse = handleGuanShiFuResponse;
exports.handleQingLongYanYueDaoResponse = handleQingLongYanYueDaoResponse;
