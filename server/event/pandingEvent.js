const {PANDING_EVENT_TIMING} = require("../config/eventConfig");
const {CARD_LOCATION} = require("../config/cardConfig");
const {emitNotifyPublicCards} = require("../utils/emitUtils");
const {clearSkillResponse} = require("../utils/responseUtils");
const {STAGE_NAME} = require("../config/gameAndStageConfig");
const {clearCardResponse} = require("../utils/responseUtils");
const {ALL_EVENTS_KEY_CONFIG} = require("../config/eventConfig");
const {findOnGoingEvent, findOnGoingEventSkill} = require("./utils");
const {generateDamageEventThenSetNextDamageEventSkill} = require("./damageEvent");
const {findNextUnDoneSkillInLastEventTimingsWithSkills} = require("./utils");
const {ACTION} = require("../action/action");
const {isNil} = require("lodash/lang");
const {moveShandianToNextPlayer, getNextNeedExecutePandingSign} = require("../utils/pandingUtils");
const {getCurrentPlayer} = require("../utils/playerUtils");
const {
    CARD_CONFIG, CARD_COLOR,
    DELAY_SCROLL_CARDS_CONFIG,
    CARD_HUASE,
    CARD_ATTRIBUTE
} = require("../config/cardConfig");
const {SKILL_CONFIG} = require("../config/skillsConfig");
const {setEventSkillResponse, findAllEventSkillsByTimingNameAndActionCard} = require("./utils");
const {emitRefreshStatus} = require("../utils/emitUtils");
const {moveCardsToDiscardPile, getCardsFromDeck, getActualCardColor} = require("../utils/cardUtils");
const {last} = require("lodash");

const generatePandingEventThenSetNextPandingEventSkill = (gameStatus, {originId, pandingNameKey}) => {
    const pandingResultCard = getCardsFromDeck(gameStatus, 1)
    gameStatus.pandingEvent = {
        originId,
        eventTimingTracker: [],
        done: false,
        pandingNameKey,
        pandingResultCard,
        pandingResultCardNeedThrow: true,
        takeEffect: undefined,
    }
    emitRefreshStatus(gameStatus); // 为了显示判定Board

    emitNotifyPublicCards(gameStatus, {
        cards: [pandingResultCard],
        fromId: CARD_LOCATION.PAIDUI,
        pandingPlayerId: gameStatus.players[originId].playerId,
        pandingNameKey,
    })
    setNextPandingEventSkill(gameStatus);
}

const setNextPandingEventSkill = (gameStatus) => {
    const pandingEvent = gameStatus.pandingEvent;
    if (!pandingEvent) {
        return;
    }

    const {originId, eventTimingTracker} = pandingEvent;

    if (eventTimingTracker.length == 0) {
        const eventTimingName = PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, originId})
        pandingEvent.eventTimingTracker.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingTracker).eventTimingName == PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingTracker)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            setStatusBasedOnPandingResult(gameStatus);
            handlePandingEventEnd(gameStatus);
        }
    }
}

const setStatusBasedOnPandingResult = (gameStatus) => {
    const pandingEvent = gameStatus.pandingEvent;
    pandingEvent.takeEffect = false
    const {pandingResultCard, pandingNameKey, originId} = pandingEvent;
    const currentPlayer = getCurrentPlayer(gameStatus);
    const pandingPlayer = gameStatus.players[originId]

    if (pandingNameKey == SKILL_CONFIG.SHU006_TIE_JI.key) {
        const useStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
        if (getActualCardColor(pandingResultCard) == CARD_COLOR.RED) {
            pandingEvent.takeEffect = true
            useStrikeEvent.cantShan = true;
        }
    } else if (pandingNameKey == CARD_CONFIG.LE_BU_SI_SHU.key ||
        pandingNameKey == CARD_CONFIG.SHAN_DIAN.key) {
        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus);
        const pandingActualCard = nextNeedPandingSign.actualCard;
        const pandingCard = nextNeedPandingSign.card;

        if (pandingNameKey == CARD_CONFIG.LE_BU_SI_SHU.key) {
            currentPlayer.removePandingSign(nextNeedPandingSign);
            if (pandingResultCard.huase !== CARD_HUASE.HONGTAO) {
                pandingEvent.takeEffect = true
                currentPlayer.skipStage[STAGE_NAME.PLAY] = true;
            }
        } else {
            currentPlayer.judgedShandian = true;
            if (pandingResultCard.huase == CARD_HUASE.HEITAO && pandingResultCard.number >= 2 && pandingResultCard.number <= 9) {
                currentPlayer.removePandingSign(nextNeedPandingSign);
                pandingEvent.takeEffect = true
                generateDamageEventThenSetNextDamageEventSkill(gameStatus, {
                    damageCards: [pandingCard],
                    damageActualCard: pandingActualCard, // 渠道
                    damageAttribute: CARD_ATTRIBUTE.LIGHTNING,// 属性
                    damageNumber: 3,
                    originId: undefined,// 来源
                    targetId: currentPlayer.playerId
                })
            } else {
                moveShandianToNextPlayer(gameStatus, nextNeedPandingSign)
            }
        }
    } else if (pandingNameKey === CARD_CONFIG.BA_GUA_ZHEN.key) {
        if (getActualCardColor(pandingResultCard) == CARD_COLOR.RED) {
            pandingEvent.takeEffect = true
            const responseCardEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.RESPONSE_CARD_EVENTS);
            responseCardEvent.responseStatus = true; // 雷击

            const onGoingUseStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
            if (onGoingUseStrikeEvent) {
                onGoingUseStrikeEvent.dodgeStatus = true; // 【贯石斧】、【青龙偃月刀】 猛进
            }
            clearCardResponse(gameStatus)
        }
    } else if (pandingNameKey === SKILL_CONFIG.WEI003_GANG_LIE.key) {
        const onGoingDamageEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);
        const onGoingDamageEventSkill = findOnGoingEventSkill(gameStatus, ALL_EVENTS_KEY_CONFIG.DAMAGE_EVENTS);

        if (pandingResultCard.huase !== CARD_HUASE.HONGTAO) {
            pandingEvent.takeEffect = true
            // 可能会被鬼才打断 需要重新设置
            const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, onGoingDamageEvent.eventTimingTracker)
            setEventSkillResponse(gameStatus, unDoneSkill)
            gameStatus.skillResponse.playerId = onGoingDamageEvent.originId;// 修改技能使用人的目标
        } else {
            clearSkillResponse(gameStatus)
            onGoingDamageEventSkill.done = true;
        }
    } else if (pandingNameKey === SKILL_CONFIG.WEI007_LUO_SHEN.key) {
        const onGoingGameStageEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.GAME_STAGE_EVENT);
        if ([CARD_HUASE.HEITAO, CARD_HUASE.CAOHUA].includes(pandingResultCard.huase)) {
            pandingEvent.takeEffect = true;
            pandingEvent.pandingResultCardNeedThrow = false;

            onGoingGameStageEvent.eventTimingTracker.pop() // 删除最后一个元素 为了继续判定
            ACTION.getFromTable(gameStatus, pandingPlayer, pandingResultCard)
        }
        clearSkillResponse(gameStatus)
    }

    // WEI006_TIAN_DU
    if (pandingPlayer.skills.map(skill => skill.key).includes(SKILL_CONFIG.WEI006_TIAN_DU.key)) {
        pandingEvent.pandingResultCardNeedThrow = false;
        ACTION.getFromTable(gameStatus, pandingPlayer, pandingResultCard)
    }

    emitRefreshStatus(gameStatus); //为了显示判定Board
}

const handlePandingEventEnd = (gameStatus) => {
    const pandingEvent = gameStatus.pandingEvent;
    if (pandingEvent.pandingResultCardNeedThrow) {
        moveCardsToDiscardPile(gameStatus, pandingEvent.pandingResultCard);
    }
    delete gameStatus.pandingEvent;
}

const executeNextOnePandingCard = (gameStatus) => {
    const currentPlayer = getCurrentPlayer(gameStatus);
    const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus);
    if (!nextNeedPandingSign) {
        throw new Error("用户没有需要判定的牌")
    }
    if (isNil(nextNeedPandingSign.isEffect)) {
        throw new Error("判定未生效 不能开始判定")
    }

    const pandingActualCard = nextNeedPandingSign.actualCard;
    const isPandingLebusishu = pandingActualCard.key == DELAY_SCROLL_CARDS_CONFIG.LE_BU_SI_SHU.key;
    const isPandingShandian = pandingActualCard.key == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.key;

    // 判定未生效 需要跳过
    if (nextNeedPandingSign.isEffect === false) {
        if (isPandingLebusishu) {
            currentPlayer.removePandingSign(nextNeedPandingSign);
            moveCardsToDiscardPile(gameStatus, pandingActualCard);
        } else if (isPandingShandian) {
            moveShandianToNextPlayer(gameStatus, nextNeedPandingSign)
        }
    }
    // 判定生效 开始判定
    else if (nextNeedPandingSign.isEffect === true) {
        generatePandingEventThenSetNextPandingEventSkill(gameStatus, {
            originId: currentPlayer.playerId,
            pandingNameKey: pandingActualCard.key
        })
    }
}


exports.generatePandingEventThenSetNextPandingEventSkill = generatePandingEventThenSetNextPandingEventSkill;
exports.setNextPandingEventSkill = setNextPandingEventSkill;
exports.executeNextOnePandingCard = executeNextOnePandingCard;