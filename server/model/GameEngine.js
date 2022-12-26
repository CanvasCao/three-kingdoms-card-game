const {
    getInitCards,
    CARD_TYPE,
    BASIC_CARDS_CONFIG,
    SCROLL_CARDS_CONFIG,
} = require("../initCards");
const {
    emitBehaviorPublicPlayCard,
    emitRefreshStatus,
    emitInit,
    emitCardBoardPublicPlayCard,
    emitThrowPublicCard,
} = require("../utils/utils");
const {
    getCurrentUser,
} = require("../utils/userUtils");
const {
    throwCards
} = require("../utils/cardUtils");
const {
    tryGoNextStage,
} = require("../utils/stageUtils");
const {actionHandler} = require("../handler/actionHandler");
const {responseHandler} = require("../handler/responseHandler");
const {throwHandler} = require("../handler/throwHandler");
const {cardBoardHandler} = require("../handler/cardBoardHandler");

const stageConfig = require("../config/stageConfig.json")

class GameEngine {
    constructor(io) {
        // TODO let logs = [];
        this.io = io;

        this.gameStatus = {
            users: {},
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
            userId: getCurrentUser(this.gameStatus).userId,
            stageName: stageConfig.stageNamesEN[this.gameStatus.stageIndex]
        }
        emitInit(this.gameStatus);
        tryGoNextStage(this.gameStatus)
    }

    // socket action
    handleAction(action) {
        emitBehaviorPublicPlayCard(this.io, action, this.gameStatus);
        this.gameStatus.action = action;
        const originUser = this.gameStatus.users[action.originId];

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
            throwCards(this.gameStatus, action.cards);
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
        }
        originUser.removeCards(action.cards);
        emitRefreshStatus(this.gameStatus);
    }

    // response
    handleResponse(response) {
        emitBehaviorPublicPlayCard(this.io, response, this.gameStatus)
        if (this.gameStatus.taoResStages.length > 0 && response?.actualCard?.CN == BASIC_CARDS_CONFIG.SHAN.CN) {
            throw new Error("求桃的时候不能出闪")
        }

        const needResponseWuxie = this.gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds.length > 0;
        const needResponseTao = this.gameStatus.taoResStages.length > 0;
        const needResponseShan = this.gameStatus.shanResStages.length > 0;

        if (needResponseWuxie) {
            responseHandler.setStatusByWuxieResponse(this.gameStatus, response);
        } else if (needResponseTao) {
            responseHandler.setStatusByTaoResponse(this.gameStatus, response);
        } else if (needResponseShan) {
            responseHandler.setStatusByShanResponse(this.gameStatus, response);
        }
        emitRefreshStatus(this.gameStatus);
    }

    // throw action
    handleThrowCards(data) {
        emitThrowPublicCard(this.gameStatus, data.cards, getCurrentUser(this.gameStatus));
        throwHandler.handleThrowCards(this.gameStatus, data)
    }

    handleCardBoardAction(data) {
        emitCardBoardPublicPlayCard(this.io, data, this.gameStatus)
        cardBoardHandler.handleCardBoard(this.gameStatus, data)
    }

    // 任意角色blood<=0时
    generateNewRoundQiuTaoResponseStages(qiutaoTargetUser) {
        if (qiutaoTargetUser.currentBlood > 0) {
            throw new Error("Don't need TAO")
        }

        const taoResStages = [];

        for (let i = this.gameStatus.currentLocation; i < this.gameStatus.currentLocation + Object.keys(this.gameStatus.users).length; i++) {
            const modLocation = i % Object.keys(this.gameStatus.users).length;
            const user = Object.values(this.gameStatus.users).find((u) => u.location == modLocation);
            if (user.isDead) {

            } else {
                taoResStages.push({
                    originId: user.userId,
                    targetId: qiutaoTargetUser.userId,
                    cardNumber: 1 - qiutaoTargetUser.currentBlood,
                })
            }
        }
        this.gameStatus.taoResStages = taoResStages
    }
}

exports.GameEngine = GameEngine;