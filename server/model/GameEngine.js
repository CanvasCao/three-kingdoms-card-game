const strikeEvent = require("../event/strikeEvent");
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
    getCurrentPlayer,
} = require("../utils/playerUtils");
const {
    throwCards, everyoneGetInitialCards
} = require("../utils/cardUtils");
const {
    tryGoToNextPlayOrResponseOrThrowTurn,
    goToNextStage,
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
            shanResponse: undefined,
            taoResponses: [],

            skillResponse: undefined,

            // 锦囊
            scrollResponses: [],
            wuxieSimultaneousResponse: {
                hasWuxiePlayerIds: [],
                wuxieChain: []// 等待全员无懈可击
            },

            // 其他
            weaponResponses: [],
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
        this.gameStatus.stage = {
            playerId: getCurrentPlayer(this.gameStatus).playerId,
            stageIndex: this.gameStatus.stageIndex,
        }
        this.gameStatus.roomId = roomId;
        everyoneGetInitialCards(this.gameStatus)
        emitInit(this.gameStatus);

        setTimeout(() => {
            tryGoToNextPlayOrResponseOrThrowTurn(this.gameStatus)
        }, 1000)
    }

    handleAction(action) {
        emitNotifyPlayPublicCard(this.gameStatus, action);
        emitNotifyAddLines(this.gameStatus, action);

        this.gameStatus.action = action;
        this.gameStatus.players[action.originId].removeCards(action.cards);

        // BASIC
        if ([BASIC_CARDS_CONFIG.SHA.CN, BASIC_CARDS_CONFIG.LEI_SHA.CN, BASIC_CARDS_CONFIG.HUO_SHA.CN].includes(action.actualCard.CN)
        ) {
            strikeEvent.generateUseStrikeEventsThenSetNextStrikeEventSkillToSkillResponse(this.gameStatus,
                {
                    originId: action.originId,
                    targetIds: action.targetIds,
                    cards: action.cards,
                    actualCard: action.actualCard
                });
        } else if (action.actualCard.CN == BASIC_CARDS_CONFIG.TAO.CN) {
            actionHandler.setStatusByTaoAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        }
        // Equipment
        else if (CARD_TYPE.EQUIPMENT == action.actualCard.type) {
            actionHandler.setStatusByEquipmentAction(this.gameStatus);
        }
        // DELAY SCROLL
        else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.SHAN_DIAN.CN) {
            actionHandler.setStatusByShanDianAction(this.gameStatus, this.gameStatus);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.LE_BU_SI_SHU.CN) {
            actionHandler.setStatusByLeBuSiShuAction(this.gameStatus, this.gameStatus);
        }
        // SCROLL
        else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.CN) {
            actionHandler.setStatusByWuZhongShengYouAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.GUO_HE_CHAI_QIAO.CN) {
            actionHandler.setStatusByGuoHeChaiQiaoAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.SHUN_SHOU_QIAN_YANG.CN) {
            actionHandler.setStatusByShunShouQianYangAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.CN) {
            actionHandler.setStatusByTaoYuanJieYiAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.NAN_MAN_RU_QIN.CN) {
            actionHandler.setStatusByNanManRuQinAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.WAN_JIAN_QI_FA.CN) {
            actionHandler.setStatusByWanJianQiFaAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.JUE_DOU.CN) {
            actionHandler.setStatusByJueDouAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.JIE_DAO_SHA_REN.CN) {
            actionHandler.setStatusByJieDaoShaRenAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.WU_GU_FENG_DENG.CN) {
            actionHandler.setStatusByWuGuFengDengAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        }

        trySettleNextScroll(this.gameStatus);
        tryFindNextSkillResponse(this.gameStatus);
        emitRefreshStatus(this.gameStatus);
    }

    handleResponse(response) {
        emitNotifyPlayPublicCard(this.gameStatus, response);
        if (this.gameStatus.taoResponses.length > 0 && response?.actualCard?.CN == BASIC_CARDS_CONFIG.SHAN.CN) {
            throw new Error("求桃的时候不能出闪")
        }

        const needResponseTao = this.gameStatus.taoResponses.length > 0;
        const needResponseShan = this.gameStatus.shanResponse;
        const needResponseSkill = this.gameStatus.skillResponse;
        const needResponseWuxie = this.gameStatus.wuxieSimultaneousResponse.hasWuxiePlayerIds.length > 0;

        // weapon
        const needResponseQingLongYanYueDao = this.gameStatus.weaponResponses.length > 0;

        // scroll
        const curScrollResponse = this.gameStatus.scrollResponses;
        const needResponseNanMan = this.gameStatus.scrollResponses.length > 0 && curScrollResponse[0].actualCard.CN == SCROLL_CARDS_CONFIG.NAN_MAN_RU_QIN.CN;
        const needResponseWanJian = this.gameStatus.scrollResponses.length > 0 && curScrollResponse[0].actualCard.CN == SCROLL_CARDS_CONFIG.WAN_JIAN_QI_FA.CN;
        const needResponseJueDou = this.gameStatus.scrollResponses.length > 0 && curScrollResponse[0].actualCard.CN == SCROLL_CARDS_CONFIG.JUE_DOU.CN;
        // 只是响应是否出杀
        const needResponseJieDao = this.gameStatus.scrollResponses.length > 0 && curScrollResponse[0].actualCard.CN == SCROLL_CARDS_CONFIG.JIE_DAO_SHA_REN.CN;


        if (needResponseTao) {
            responseCardHandler.setStatusByTaoResponse(this.gameStatus, response);
        } else if (needResponseShan) {
            responseCardHandler.setStatusByShanResponse(this.gameStatus, response);
        } else if (needResponseSkill) {
            responseCardHandler.setStatusBySkillResponse(this.gameStatus, response);
        } else if (needResponseWuxie) {
            responseCardHandler.setStatusByWuxieResponse(this.gameStatus, response);
        }

        // 武器
        else if (needResponseQingLongYanYueDao) {
            responseCardHandler.setStatusByQingLongYanYueDaoResponse(this.gameStatus, response);
        }
        // scroll
        else if (needResponseNanMan || needResponseWanJian) {
            responseCardHandler.setStatusByNanManOrWanJianResponse(this.gameStatus, response);
        } else if (needResponseJueDou) {
            responseCardHandler.setStatusByJueDouResponse(this.gameStatus, response);
        } else if (needResponseJieDao) {
            responseCardHandler.setStatusByJieDaoResponse(this.gameStatus, response);
        }


        // 第一个目标求闪/桃之后 继续找马超下一个铁骑的技能
        tryFindNextSkillResponse(this.gameStatus);

        // 下一个人自动响应锦囊 或求无懈
        trySettleNextScroll(this.gameStatus)

        // 打无懈可击延迟锦囊生效后/闪电求桃之后 需要判断是不是从判定阶段到出牌阶段
        tryGoToNextPlayOrResponseOrThrowTurn(this.gameStatus);

        emitRefreshStatus(this.gameStatus);
    }

    handleThrowCards(data) {
        emitNotifyThrowPlayPublicCard(this.gameStatus, data, getCurrentPlayer(this.gameStatus));
        throwHandler.handleThrowCards(this.gameStatus, data)
        goToNextStage(this.gameStatus);
    }

    handleCardBoardAction(data) {
        emitNotifyCardBoardAction(this.gameStatus, data)
        cardBoardHandler.handleCardBoard(this.gameStatus, data)

        // 第一个目标求闪/桃之后 继续找马超下一个铁骑的技能
        tryFindNextSkillResponse(this.gameStatus);

        // 下一个人自动响应锦囊 或求无懈
        trySettleNextScroll(this.gameStatus)

        // 打无懈可击延迟锦囊生效后/闪电求桃之后 需要判断是不是从判定阶段到出牌阶段
        tryGoToNextPlayOrResponseOrThrowTurn(this.gameStatus);

        emitRefreshStatus(this.gameStatus);
    }

    handleWuguBoardAction(data) {
        emitNotifyPickWuGuCard(this.gameStatus, data);
        wuguBoardHandler.handleWuGuBoard(this.gameStatus, data)

        // 下一个五谷丰登
        trySettleNextScroll(this.gameStatus)
        emitRefreshStatus(this.gameStatus);
    }
}

exports.GameEngine = GameEngine;