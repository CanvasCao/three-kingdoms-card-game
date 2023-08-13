const strikeEvent = require("../event/strikeEvent");
const {everyoneGetInitialCards} = require("../utils/cardUtils");
const {setGameStatusStage} = require("../utils/stageUtils");
const {heroSelectBoardBoardHandler} = require("../handler/heroSelectBoardHandler");
const {RESPONSE_TYPE_CONFIG} = require("../config/responseTypeConfig");
const {EQUIPMENT_CARDS_CONFIG} = require("../config/cardConfig");
const {getResponseType} = require("../utils/responseUtils");
const {trySettleNextScroll} = require("../utils/afterActionAndResponseUtils");
const {tryFindNextSkillResponse} = require("../utils/afterActionAndResponseUtils");
const {
    getInitCards,
} = require("../initCards");
const {
    CARD_TYPE,
    BASIC_CARDS_CONFIG,
    SCROLL_CARDS_CONFIG,
} = require("../config/cardConfig")
const {
    emitRefreshStatus,
    emitInit,
    emitNotifyPlayPublicCard,
    emitNotifyCardBoardAction,
    emitNotifyAddLines,
    emitNotifyThrowPlayPublicCard,
    emitNotifyPickWuGuCard,
} = require("../utils/emitUtils");
const {
    throwCards
} = require("../utils/cardUtils");
const {
    tryGoToNextPlayOrResponseOrThrowTurn,
} = require("../utils/stageUtils");
const {actionHandler} = require("../handler/actionHandler");
const {responseCardHandler} = require("../handler/responseHandler");
const {throwHandler} = require("../handler/throwHandler");
const {cardBoardHandler} = require("../handler/cardBoardHandler");
const {wuguBoardHandler} = require("../handler/wuguBoardHandler");

class GameEngine {
    constructor(io) {
        this.gameStatus = {
            roomId: '',
            players: {},
            stage: {},
            action: {},

            // 基础牌
            cardResponse: undefined,
            taoResponses: [],

            // skill
            skillResponse: undefined,

            // cardBoard
            cardBoardResponses: [],

            // 锦囊
            scrollResponses: [],
            wuxieSimultaneousResponse: {
                hasWuxiePlayerIds: [],
                wuxieChain: []// 等待全员无懈可击
            },

            // 其他
            wugufengdengCards: [],
            tieSuoTempStorage: [],

            // 不需要传到前端
            io: io,
            throwedCards: [],
            initCards: getInitCards(),
            currentLocation: 0,
            stageIndex: 0,
        }
    }

    startEngine(roomId) {
        this.gameStatus.roomId = roomId;
        // 选将
        emitInit(this.gameStatus);
    }

    handleAction(action) {
        this.gameStatus.action = action;
        this.gameStatus.players[action.originId].removeCards(action.cards);

        // BASIC
        if ([BASIC_CARDS_CONFIG.SHA.key, BASIC_CARDS_CONFIG.LEI_SHA.key, BASIC_CARDS_CONFIG.HUO_SHA.key].includes(action.actualCard.key)
        ) {
            strikeEvent.generateUseStrikeEventsThenSetNextStrikeEventSkill(this.gameStatus,
                {
                    originId: action.originId,
                    targetIds: action.targetIds,
                    cards: action.cards,
                    actualCard: action.actualCard
                });
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.key == BASIC_CARDS_CONFIG.TAO.key) {
            actionHandler.setStatusByTaoAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        }
        // Equipment
        else if (CARD_TYPE.EQUIPMENT == action.actualCard.type) {
            actionHandler.setStatusByEquipmentAction(this.gameStatus);
        }
        // DELAY SCROLL
        else if (action.actualCard.key == SCROLL_CARDS_CONFIG.SHAN_DIAN.key) {
            actionHandler.setStatusByShanDianAction(this.gameStatus, this.gameStatus);
        } else if (action.actualCard.key == SCROLL_CARDS_CONFIG.LE_BU_SI_SHU.key) {
            actionHandler.setStatusByLeBuSiShuAction(this.gameStatus, this.gameStatus);
        }
        // SCROLL
        else if (action.actualCard.key == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.key) {
            actionHandler.setStatusByWuZhongShengYouAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.key == SCROLL_CARDS_CONFIG.GUO_HE_CHAI_QIAO.key) {
            actionHandler.setStatusByGuoHeChaiQiaoAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.key == SCROLL_CARDS_CONFIG.SHUN_SHOU_QIAN_YANG.key) {
            actionHandler.setStatusByShunShouQianYangAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.key == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.key) {
            actionHandler.setStatusByTaoYuanJieYiAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.key == SCROLL_CARDS_CONFIG.NAN_MAN_RU_QIN.key) {
            actionHandler.setStatusByNanManRuQinAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.key == SCROLL_CARDS_CONFIG.WAN_JIAN_QI_FA.key) {
            actionHandler.setStatusByWanJianQiFaAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.key == SCROLL_CARDS_CONFIG.JUE_DOU.key) {
            actionHandler.setStatusByJueDouAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.key == SCROLL_CARDS_CONFIG.JIE_DAO_SHA_REN.key) {
            actionHandler.setStatusByJieDaoShaRenAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.key == SCROLL_CARDS_CONFIG.WU_GU_FENG_DENG.key) {
            actionHandler.setStatusByWuGuFengDengAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        }

        trySettleNextScroll(this.gameStatus);
        tryFindNextSkillResponse(this.gameStatus);
        emitRefreshStatus(this.gameStatus);

        emitNotifyPlayPublicCard(this.gameStatus, action);
        emitNotifyAddLines(this.gameStatus, {
            fromId: action.originId,
            toIds: action.targetId ? [action.targetId] : action.targetIds,
            actualCard: action.actualCard
        });
    }

    handleResponse(response) {
        if (this.gameStatus.taoResponses.length > 0 && response?.actualCard?.key == BASIC_CARDS_CONFIG.SHAN.key) {
            throw new Error("求桃的时候不能出闪")
        }

        const responseType = getResponseType(this.gameStatus);
        const skillNameKey = this.gameStatus?.skillResponse?.skillNameKey
        switch (responseType) {
            case RESPONSE_TYPE_CONFIG.TAO:
                responseCardHandler.setStatusByTaoResponse(this.gameStatus, response);
                break;
            case RESPONSE_TYPE_CONFIG.CARD:
                responseCardHandler.setStatusByCardResponse(this.gameStatus, response);
                break;
            case RESPONSE_TYPE_CONFIG.SKILL:
                responseCardHandler.setStatusBySkillResponse(this.gameStatus, response);
                break;
            case RESPONSE_TYPE_CONFIG.WUXIE:
                responseCardHandler.setStatusByWuxieResponse(this.gameStatus, response);
                break;
            case RESPONSE_TYPE_CONFIG.SCROLL:
                const curScrollResponse = this.gameStatus.scrollResponses[0];
                if (curScrollResponse.actualCard.key === SCROLL_CARDS_CONFIG.JIE_DAO_SHA_REN.key) {
                    responseCardHandler.setStatusByJieDaoResponse(this.gameStatus, response);
                }
                break
        }

        // 第一个目标求闪/桃之后 继续找马超下一个铁骑的技能
        tryFindNextSkillResponse(this.gameStatus);

        // 下一个人自动响应锦囊 或求无懈
        trySettleNextScroll(this.gameStatus)

        // 打无懈可击延迟锦囊生效后/闪电求桃之后 需要判断是不是从判定阶段到出牌阶段
        tryGoToNextPlayOrResponseOrThrowTurn(this.gameStatus);

        emitRefreshStatus(this.gameStatus);

        emitNotifyPlayPublicCard(
            this.gameStatus,
            response,
            responseType == RESPONSE_TYPE_CONFIG.SKILL ? skillNameKey : undefined
        );
    }

    handleThrowCards(data) {
        throwHandler.handleThrowCards(this.gameStatus, data)
        emitRefreshStatus(this.gameStatus);
        emitNotifyThrowPlayPublicCard(this.gameStatus, data);

        tryGoToNextPlayOrResponseOrThrowTurn(this.gameStatus);
        emitRefreshStatus(this.gameStatus);
    }

    handleCardBoardAction(data) {
        cardBoardHandler.handleCardBoard(this.gameStatus, data)

        // 第一个目标求闪/桃之后 继续找马超下一个铁骑的技能
        tryFindNextSkillResponse(this.gameStatus);

        // 下一个人自动响应锦囊 或求无懈
        trySettleNextScroll(this.gameStatus)

        // 打无懈可击延迟锦囊生效后/闪电求桃之后 需要判断是不是从判定阶段到出牌阶段
        tryGoToNextPlayOrResponseOrThrowTurn(this.gameStatus);

        emitRefreshStatus(this.gameStatus);

        emitNotifyCardBoardAction(this.gameStatus, data)
    }

    handleWuguBoardAction(data) {
        wuguBoardHandler.handleWuGuBoard(this.gameStatus, data)

        // 下一个五谷丰登
        trySettleNextScroll(this.gameStatus)
        emitRefreshStatus(this.gameStatus);

        emitNotifyPickWuGuCard(this.gameStatus, data);
    }

    handleHeroSelectBoardAction(data) {
        heroSelectBoardBoardHandler.handleHeroSelect(this.gameStatus, data)

        if (Object.values(this.gameStatus.players).every((p) => p.heroId)) {
            setGameStatusStage(this.gameStatus)
            everyoneGetInitialCards(this.gameStatus)
            emitRefreshStatus(this.gameStatus);

            tryGoToNextPlayOrResponseOrThrowTurn(this.gameStatus)
        }

        setTimeout(() => {
            emitRefreshStatus(this.gameStatus);
        }, 1000)
    }
}

exports.GameEngine = GameEngine;