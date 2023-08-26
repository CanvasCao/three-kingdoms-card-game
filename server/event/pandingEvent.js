const {STAGE_NAME} = require("../config/gameAndStageConfig");
const {clearCardResponse} = require("../utils/responseUtils");
const {ALL_EVENTS_KEY_CONFIG} = require("../config/eventConfig");
const {findOnGoingEvent} = require("./utils");
const {generateDamageEventThenSetNextDamageEventSkill} = require("./damageEvent");
const {findNextUnDoneSkillInLastEventTimingsWithSkills} = require("./utils");
const {PANDING_EVENT_TIMINGS} = require("../config/eventConfig");
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
const {emitNotifyPandingPlayPublicCard, emitRefreshStatus} = require("../utils/emitUtils");
const {throwCards, getCards, getActualCardColor} = require("../utils/cardUtils");
const {last} = require("lodash");

const generatePandingEventThenSetNextPandingEventSkill = (gameStatus, {originId, pandingNameKey}) => {
    const pandingResultCard = getCards(gameStatus, 1)
    gameStatus.pandingEvent = {
        originId,
        eventTimingsWithSkills: [],
        done: false,
        pandingNameKey,
        pandingResultCard,
    }
    emitRefreshStatus(gameStatus); //为了显示判定Board
    emitNotifyPandingPlayPublicCard(gameStatus, pandingResultCard, gameStatus.players[originId], pandingNameKey);
    setNextPandingEventSkill(gameStatus);
}

const setNextPandingEventSkill = (gameStatus) => {
    const pandingEvent = gameStatus.pandingEvent;
    if (!pandingEvent) {
        return;
    }

    const {originId, eventTimingsWithSkills} = pandingEvent;

    let timingIndex = 0;
    if (eventTimingsWithSkills.length == 0) {
        const eventTimingName = PANDING_EVENT_TIMINGS[timingIndex] // BEFORE_PANDING_TAKE_EFFECT
        const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, originId})
        pandingEvent.eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            setEventSkillResponse(gameStatus, eventTimingSkills[0])
            return;
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == PANDING_EVENT_TIMINGS[timingIndex]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
        if (unDoneSkill) {
            setEventSkillResponse(gameStatus, unDoneSkill)
            return;
        } else {
            const eventTimingName = PANDING_EVENT_TIMINGS[timingIndex + 1] // AFTER_PANDING_TAKE_EFFECT
            const eventTimingSkills = findAllEventSkillsByTimingNameAndActionCard(gameStatus, {eventTimingName, originId})
            pandingEvent.eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                setEventSkillResponse(gameStatus, eventTimingSkills[0])
                return;
            }
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == PANDING_EVENT_TIMINGS[timingIndex + 1]) {
        const unDoneSkill = findNextUnDoneSkillInLastEventTimingsWithSkills(gameStatus, eventTimingsWithSkills)
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
    // pandingEvent.done = true;

    const pandingResultCard = pandingEvent.pandingResultCard;
    const currentPlayer = getCurrentPlayer(gameStatus);

    if (pandingEvent.pandingNameKey == SKILL_CONFIG.SHU006_TIE_JI.key) {
        const useStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
        if (getActualCardColor(pandingResultCard) == CARD_COLOR.RED) {
            pandingEvent.takeEffect = true
            useStrikeEvent.cantShan = true;
        } else {
            pandingEvent.takeEffect = false
        }
    } else if (pandingEvent.pandingNameKey == CARD_CONFIG.LE_BU_SI_SHU.key ||
        pandingEvent.pandingNameKey == CARD_CONFIG.SHAN_DIAN.key) {
        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus);
        const pandingActualCard = nextNeedPandingSign.actualCard;
        const pandingCard = nextNeedPandingSign.card;

        if (pandingEvent.pandingNameKey == CARD_CONFIG.LE_BU_SI_SHU.key) {
            currentPlayer.removePandingSign(nextNeedPandingSign);
            if (pandingResultCard.huase !== CARD_HUASE.HONGTAO) {
                pandingEvent.takeEffect = true
                currentPlayer.skipStage[STAGE_NAME.PLAY] = true;
            } else {
                pandingEvent.takeEffect = false
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
                pandingEvent.takeEffect = false
                moveShandianToNextPlayer(gameStatus, nextNeedPandingSign)
            }
        }
    } else if (pandingEvent.pandingNameKey === CARD_CONFIG.BA_GUA_ZHEN.key) {
        if (getActualCardColor(pandingResultCard) == CARD_COLOR.RED) {
            pandingEvent.takeEffect = true
            const responseCardEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.RESPONSE_CARD_EVENTS);
            responseCardEvent.responseStatus = true; // 雷击

            const onGoingUseStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
            if (onGoingUseStrikeEvent) {
                onGoingUseStrikeEvent.dodgeStatus = true; // 【贯石斧】、【青龙偃月刀】 猛进
            }

            clearCardResponse(gameStatus)
        } else {
            pandingEvent.takeEffect = false
        }
    }

    emitRefreshStatus(gameStatus); //为了显示判定Board
}

const handlePandingEventEnd = (gameStatus) => {
    const pandingEvent = gameStatus.pandingEvent;
    throwCards(gameStatus, pandingEvent.pandingResultCard);
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

    const pandingCard = nextNeedPandingSign.card;
    const pandingActualCard = nextNeedPandingSign.actualCard;
    const isPandingLebusishu = pandingActualCard.key == DELAY_SCROLL_CARDS_CONFIG.LE_BU_SI_SHU.key;
    const isPandingShandian = pandingActualCard.key == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.key;

    // 判定未生效 需要跳过
    if (nextNeedPandingSign.isEffect === false) {
        if (isPandingLebusishu) {
            currentPlayer.removePandingSign(nextNeedPandingSign);
            throwCards(gameStatus, pandingActualCard);
        } else if (isPandingShandian) {
            moveShandianToNextPlayer(gameStatus, nextNeedPandingSign)
        }
    }
    // 判定生效 开始判定
    else if (nextNeedPandingSign.isEffect === true) {
        generatePandingEventThenSetNextPandingEventSkill(gameStatus, {
            originId: currentPlayer.playerId,
            pandingNameKey: pandingCard.key
        })
    }
}


exports.generatePandingEventThenSetNextPandingEventSkill = generatePandingEventThenSetNextPandingEventSkill;
exports.setNextPandingEventSkill = setNextPandingEventSkill;
exports.executeNextOnePandingCard = executeNextOnePandingCard;