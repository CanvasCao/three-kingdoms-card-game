const {DELAY_SCROLL_CARDS_CONFIG} = require("../config/cardConfig");
const {isNil} = require("lodash/lang");
const {moveShandianToNextPlayer} = require("../utils/pandingUtils");
const {setGameStatusByTieSuoTempStorage} = require("../utils/tieSuoUtils");
const {generateTieSuoTempStorageByShandian} = require("../utils/tieSuoUtils");
const {CARD_HUASE} = require("../config/cardConfig");
const {getCurrentPlayer} = require("../utils/playerUtils");
const {getNextNeedExecutePandingSign} = require("../utils/pandingUtils");
const {CARD_CONFIG} = require("../config/cardConfig");
const {SKILL_NAMES} = require("../config/skillsConfig");
const {setNextStrikeEventSkillToSkillResponse} = require("./strikeEvent");
const {setEventSkillResponse} = require("./utils");
const {CARD_COLOR} = require("../config/cardConfig");
const {getActualCardColor} = require("../utils/cardUtils");
const {findOnGoingUseStrikeEvent} = require("./utils");
const {emitNotifyPandingPlayPublicCard} = require("../utils/emitUtils");
const {throwCards} = require("../utils/cardUtils");
const {getCards} = require("../utils/cardUtils");
const {findAllEventSkillsByTimingName} = require("./utils");
const {PANDING_EVENT_TIMING} = require("../config/eventConfig");
const {last} = require("lodash");

const generatePandingEventThenSetNextPandingEventSkillToSkillResponse = (gameStatus, originId, pandingContent) => {
    const pandingResultCard = getCards(gameStatus, 1)
    gameStatus.pandingEvent = {
        originId,
        eventTimingsWithSkills: [],
        done: false,
        pandingContent,
        pandingResultCard,
    }

    emitNotifyPandingPlayPublicCard(gameStatus, pandingResultCard, gameStatus.players[originId], pandingContent);
    setNextPandingEventSkillToSkillResponse(gameStatus);
}

const setNextPandingEventSkillToSkillResponse = (gameStatus) => {
    const pandingEvent = gameStatus.pandingEvent;
    if (!pandingEvent) {
        return;
    }

    const originId = pandingEvent.originId;
    const eventTimingsWithSkills = pandingEvent.eventTimingsWithSkills

    if (eventTimingsWithSkills.length == 0) {
        const eventTimingName = PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT
        const eventTimingSkills = findAllEventSkillsByTimingName(gameStatus, {eventTimingName, originId})
        pandingEvent.eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

        if (eventTimingSkills.length > 0) {
            gameStatus.skillResponse = eventTimingSkills[0]
            return;
        }
    }

    if (last(eventTimingsWithSkills).eventTimingName == PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT) {
        const unChooseToReleaseSkill = last(eventTimingsWithSkills).eventTimingSkills
            .find((eventTimingSkill) => !eventTimingSkill.done)

        if (unChooseToReleaseSkill) {
            setEventSkillResponse(gameStatus, unChooseToReleaseSkill)
            return;
        } else {
            const eventTimingName = PANDING_EVENT_TIMING.AFTER_PANDING_TAKE_EFFECT
            const eventTimingSkills = findAllEventSkillsByTimingName(gameStatus, {eventTimingName, originId})
            pandingEvent.eventTimingsWithSkills.push({eventTimingName, eventTimingSkills})

            if (eventTimingSkills.length > 0) {
                gameStatus.skillResponse = eventTimingSkills[0]
                return;
            } else { // 判定结束
                setStatusBasedOnPandingResult(gameStatus);
                handlePandingEventEnd(gameStatus);
            }
        }
    }
}

const handlePandingEventEnd = (gameStatus) => {
    const pandingEvent = gameStatus.pandingEvent;

    const allChangePandingCards = pandingEvent.eventTimingsWithSkills[0].eventTimingSkills
        .map(s => s.releaseCards?.[0])
        .filter(Boolean)
    throwCards(gameStatus, [...allChangePandingCards, pandingEvent.pandingResultCard]);
    delete gameStatus.pandingEvent;
}

const setStatusBasedOnPandingResult = (gameStatus) => {
    const pandingEvent = gameStatus.pandingEvent;
    pandingEvent.done = true;

    const pandingResultCard = pandingEvent.pandingResultCard;
    const currentPlayer = getCurrentPlayer(gameStatus);

    if (pandingEvent.pandingContent == SKILL_NAMES.SHU["006"].TIE_JI) {
        const useStrikeEvent = findOnGoingUseStrikeEvent(gameStatus);
        if (getActualCardColor(pandingResultCard) == CARD_COLOR.RED) {
            useStrikeEvent.cantShan = true;
        }
        setNextStrikeEventSkillToSkillResponse(gameStatus) // 结算完回到铁骑
    } else if (pandingEvent.pandingContent == CARD_CONFIG.LE_BU_SI_SHU.CN || pandingEvent.pandingContent == CARD_CONFIG.SHAN_DIAN.CN) {
        const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus);
        const pandingActualCard = nextNeedPandingSign.actualCard;

        if (pandingEvent.pandingContent == CARD_CONFIG.LE_BU_SI_SHU.CN) {
            currentPlayer.removePandingSign(nextNeedPandingSign);
            throwCards(gameStatus, pandingActualCard);
            if (pandingResultCard.huase !== CARD_HUASE.HONGTAO) {
                currentPlayer.skipPlay = true;
            }
        } else {
            currentPlayer.judgedShandian = true;
            if (pandingResultCard.huase == CARD_HUASE.HEITAO && pandingResultCard.number >= 2 && pandingResultCard.number <= 9) {
                currentPlayer.removePandingSign(nextNeedPandingSign);
                throwCards(gameStatus, pandingActualCard);

                currentPlayer.reduceBlood(3);
                generateTieSuoTempStorageByShandian(gameStatus);

                if (currentPlayer.currentBlood > 0) { // <0 setGameStatusByTieSuoTempStorage的逻辑在求桃之后 如果我还活着需要立刻结算下一个人的铁锁连环
                    setGameStatusByTieSuoTempStorage(gameStatus);
                }
            } else {
                moveShandianToNextPlayer(gameStatus, nextNeedPandingSign)
            }
        }
    }
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
    const isPandingLebusishu = pandingActualCard.CN == DELAY_SCROLL_CARDS_CONFIG.LE_BU_SI_SHU.CN;
    const isPandingShandian = pandingActualCard.CN == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN;

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
        generatePandingEventThenSetNextPandingEventSkillToSkillResponse(gameStatus, currentPlayer.playerId, pandingCard.CN)
    }
}


exports.generatePandingEventThenSetNextPandingEventSkillToSkillResponse = generatePandingEventThenSetNextPandingEventSkillToSkillResponse;
exports.setNextPandingEventSkillToSkillResponse = setNextPandingEventSkillToSkillResponse;
exports.executeNextOnePandingCard = executeNextOnePandingCard;