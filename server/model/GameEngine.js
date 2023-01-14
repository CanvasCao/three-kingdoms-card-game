const {
    getInitCards,
    CARD_TYPE,
    BASIC_CARDS_CONFIG,
    SCROLL_CARDS_CONFIG,
} = require("../initCards");
const {
    emitRefreshStatus,
    emitInit,
    emitNotifyPlayPublicCard,
    emitNotifyCardBoardAction,
    emitNotifyPandingPlayPublicCard,
    emitNotifyAddLines,
    emitNotifyThrowPlayPublicCard,
    emitNotifyWuGuCardChange,
} = require("../utils/emitUtils");
const {
    getCurrentPlayer,
    getAllPlayersStartFromFirstLocation,
} = require("../utils/playerUtils");
const {
    throwCards
} = require("../utils/cardUtils");
const {
    tryGoNextStage,
    goToNextStage,
} = require("../utils/stageUtils");
const {actionHandler} = require("../handler/actionHandler");
const {responseCardHandler} = require("../handler/responseHandler");
const {throwHandler} = require("../handler/throwHandler");
const {cardBoardHandler} = require("../handler/cardBoardHandler");
const {wuguBoardHandler} = require("../handler/wuguBoardHandler");
const stageConfig = require("../config/stageConfig.json")

class GameEngine {
    constructor(io) {
        // TODO let logs = [];
        this.io = io;

        this.gameStatus = {
            players: {},
            stage: {},
            action: {},

            // 基础牌
            shanResStages: [],
            taoResStages: [],

            // 锦囊
            scrollResStages: [],
            wuxieSimultaneousResStage: {
                hasWuxiePlayerIds: [],
                wuxieChain: []// 等待全员无懈可击
            },
            wugufengdengCards: [],
            tieSuoTempStorage: [],

            // 不需要传到前端的
            io: io,
            throwedCards: [],
            initCards: getInitCards(),
            currentLocation: 0,
            stageIndex: 0,
        }
    }

    startEngine() {
        this.gameStatus.stage = {
            playerId: getCurrentPlayer(this.gameStatus).playerId,
            stageName: stageConfig.stageNamesEN[this.gameStatus.stageIndex]
        }
        emitInit(this.gameStatus);
        tryGoNextStage(this.gameStatus)
    }

    handleAction(action) {
        emitNotifyPlayPublicCard(this.io, action, this.gameStatus);
        emitNotifyAddLines(this.io, action);
        this.gameStatus.action = action;
        const originPlayer = this.gameStatus.players[action.originId];

        // BASIC
        if ([BASIC_CARDS_CONFIG.SHA.CN,
            BASIC_CARDS_CONFIG.LEI_SHA.CN,
            BASIC_CARDS_CONFIG.HUO_SHA.CN].includes(action.actualCard.CN)
        ) {
            actionHandler.setStatusByShaAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.CN == BASIC_CARDS_CONFIG.TAO.CN) {
            actionHandler.setStatusByTaoAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        }
        // Equipment
        else if (CARD_TYPE.EQUIPMENT == action.actualCard.type) {
            actionHandler.setStatusByEquipmentAction(this.gameStatus);
        }
        // DELAY
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

        originPlayer.removeHandCards(action.cards);
        emitRefreshStatus(this.gameStatus);
    }

    handleResponse(response) {
        emitNotifyPlayPublicCard(this.io, response, this.gameStatus);
        if (this.gameStatus.taoResStages.length > 0 && response?.actualCard?.CN == BASIC_CARDS_CONFIG.SHAN.CN) {
            throw new Error("求桃的时候不能出闪")
        }

        const needResponseWuxie = this.gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds.length > 0;
        const needResponseTao = this.gameStatus.taoResStages.length > 0;
        const needResponseShan = this.gameStatus.shanResStages.length > 0;

        const curScrollResStages = this.gameStatus.scrollResStages;
        const needResponseNanMan = this.gameStatus.scrollResStages.length > 0 && curScrollResStages[0].actualCard.CN == SCROLL_CARDS_CONFIG.NAN_MAN_RU_QIN.CN;
        const needResponseWanJian = this.gameStatus.scrollResStages.length > 0 && curScrollResStages[0].actualCard.CN == SCROLL_CARDS_CONFIG.WAN_JIAN_QI_FA.CN;
        const needResponseJueDou = this.gameStatus.scrollResStages.length > 0 && curScrollResStages[0].actualCard.CN == SCROLL_CARDS_CONFIG.JUE_DOU.CN;

        // 只是响应是否出杀
        const needResponseJieDao = this.gameStatus.scrollResStages.length > 0 && curScrollResStages[0].actualCard.CN == SCROLL_CARDS_CONFIG.JIE_DAO_SHA_REN.CN;

        if (needResponseWuxie) {
            responseCardHandler.setStatusByWuxieResponse(this.gameStatus, response);
        } else if (needResponseTao) {
            responseCardHandler.setStatusByTaoResponse(this.gameStatus, response);
        } else if (needResponseShan) {
            responseCardHandler.setStatusByShanResponse(this.gameStatus, response);
        } else if (needResponseNanMan || needResponseWanJian) {
            responseCardHandler.setStatusByNanManOrWanJianResponse(this.gameStatus, response);
        } else if (needResponseJueDou) {
            responseCardHandler.setStatusByJueDouResponse(this.gameStatus, response);
        } else if (needResponseJieDao) {
            responseCardHandler.setStatusByJieDaoResponse(this.gameStatus, response);
        }

        emitRefreshStatus(this.gameStatus);

        // 打无懈可击延迟锦囊生效后 需要判断是不是从判定阶段到出牌阶段
        // 闪电求桃之后 需要判断是不是从判定阶段到出牌阶段
        tryGoNextStage(this.gameStatus);
    }

    handleThrowCards(data) {
        emitNotifyThrowPlayPublicCard(this.gameStatus, data, getCurrentPlayer(this.gameStatus));
        throwHandler.handleThrowCards(this.gameStatus, data)
        goToNextStage(this.gameStatus);
    }

    handleCardBoardAction(data) {
        emitNotifyCardBoardAction(this.io, data, this.gameStatus)
        cardBoardHandler.handleCardBoard(this.gameStatus, data)
        emitRefreshStatus(this.gameStatus);
    }

    handleWuguBoardAction(data) {
        emitNotifyWuGuCardChange(this.io, data);
        wuguBoardHandler.handleWuGuBoard(this.gameStatus, data)
        emitRefreshStatus(this.gameStatus);
    }

    // 任意角色blood<=0时
    generateNewRoundQiuTaoResponseStages(qiutaoTargetPlayer) {
        if (qiutaoTargetPlayer.currentBlood > 0) {
            throw new Error("Don't need TAO")
        }

        const currentPlayer = getCurrentPlayer(this.gameStatus);
        const firstLocation = currentPlayer.location;
        const players = getAllPlayersStartFromFirstLocation(this.gameStatus, firstLocation)

        this.gameStatus.taoResStages = players.map((player) => {
            return {
                originId: player.playerId,
                targetId: qiutaoTargetPlayer.playerId,
                cardNumber: 1 - qiutaoTargetPlayer.currentBlood,
            }
        })
    }
}

exports.GameEngine = GameEngine;