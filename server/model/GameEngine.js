const {
    getInitCards,
    CARD_TYPE,
    BASIC_CARDS_CONFIG,
    SCROLL_CARDS_CONFIG,
    DELAY_SCROLL_CARDS_CONFIG,
    EQUIPMENT_CARDS_CONFIG,
    EQUIPMENT_TYPE
} = require("../initCards");
const {
    emitBehaviorPublicPlayCard,
    emitPandingPublicCard,
    emitThrowPublicCard,
    emitRefreshStatus,
    emitInit,
} = require("../utils/utils");
const {
    getCurrentUser,
} = require("../utils/userUtils");
const {
    throwCards, getCards
} = require("../utils/cardUtils");
const {
    canTryGoNextStage,
    tryGoNextStage,
    goToNextStage,
} = require("../utils/stageUtils");
const {actionHandler} = require("../handler/actionHandler");
const {responseHandler} = require("../handler/responseHandler");
const {throwHandler} = require("../handler/throwHandler");

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

    // socket actions
    handleAction(action) {
        emitBehaviorPublicPlayCard(this.io, action, this.gameStatus);
        this.gameStatus.action = action;
        const originUser = action.actions ?
            this.gameStatus.users[action.actions[0].originId] :
            this.gameStatus.users[action.originId];

        if ([BASIC_CARDS_CONFIG.SHA.CN,
            BASIC_CARDS_CONFIG.LEI_SHA.CN,
            BASIC_CARDS_CONFIG.HUO_SHA.CN].includes(action.actualCard.CN)
        ) {
            actionHandler.setStatusByShaAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.CN == BASIC_CARDS_CONFIG.TAO.CN) {
            actionHandler.setStatusByTaoAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (CARD_TYPE.EQUIPMENT == action.actualCard.type) {
            actionHandler.setStatusByEquipmentAction(this.gameStatus);
            throwCards(this.gameStatus, action.cards);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.SHAN_DIAN.CN) {
            actionHandler.setStatusByShanDianAction(this.gameStatus, this.gameStatus);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.LE_BU_SI_SHU.CN) {
            actionHandler.setStatusByLeBuSiShuAction(this.gameStatus, this.gameStatus);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.CN) {
            actionHandler.setStatusByWuZhongShengYouAction(this.gameStatus);
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
            responseHandler.setStatusByTaoResponse(this.gameStatus, response,
                this.setStateByTieSuoTempStorage.bind(this),
            );
        } else if (needResponseShan) {
            responseHandler.setStatusByShanResponse(this.gameStatus, response,
                this.generateTieSuoTempStorageByShaAction.bind(this),
                this.setStateByTieSuoTempStorage.bind(this));
        }
        emitRefreshStatus(this.gameStatus);
    }

    // throw actions
    handleThrowCards(data) {
        throwHandler.handleThrowCards(this.gameStatus, data)
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

    resetTieSuo() {
        Object.values(this.gameStatus.users).forEach((u) => {
            u.isTieSuo = false;
        })
    }

    // 属性杀没出闪的时候需要
    generateTieSuoTempStorageByShaAction() {
        const batchAction = this.gameStatus.action;
        const actualCard = batchAction.actualCard;
        if (!actualCard.attribute) {
            return;
        }

        // const action = batchAction.actions ? batchAction.actions[0] : batchAction;
        const firstAttributeAction = batchAction.actions.find((a) => {
            const targetUser = this.gameStatus.users[a.targetId];
            return targetUser.isTieSuo;
        })

        // 没有任何人是铁锁状态
        if (!firstAttributeAction) {
            return
        }

        const firstAttributeActionTargetUserId = firstAttributeAction.targetId;
        const firstAttributeActionTargetUser = this.gameStatus.users[firstAttributeActionTargetUserId]
        this.generateTieSuoTempStorage(firstAttributeActionTargetUser, firstAttributeAction, 1);
    }

    generateTieSuoTempStorageByShandian() {
        this.generateTieSuoTempStorage(getCurrentUser(this.gameStatus), null, 3);
    }

    generateTieSuoTempStorage(firstAttributeDamageTargetUser, firstAttributeAction, damage) {
        const firstLocation = firstAttributeDamageTargetUser.location;
        const tieSuoTempStorage = []
        for (let i = firstLocation; i < firstLocation + Object.keys(this.gameStatus.users).length; i++) {
            const modLocation = i % Object.keys(this.gameStatus.users).length;
            const user = Object.values(this.gameStatus.users).find((u) => u.location == modLocation);
            if (user.isTieSuo && firstAttributeDamageTargetUser.userId !== user.userId) { // 除了第一个命中的 其他人都要进 tieSuoTempStorage
                let tempItem = {
                    damage,
                    targetId: user.userId,
                }
                if (firstAttributeAction) {
                    tempItem = {
                        ...tempItem,
                        originId: firstAttributeAction.originId,
                        cards: firstAttributeAction.cards,
                        actualCard: firstAttributeAction.actualCard,
                    }
                }
                tieSuoTempStorage.push(tempItem)
            }
        }

        this.resetTieSuo();
        this.gameStatus.tieSuoTempStorage = tieSuoTempStorage;
    }

    // 一个角色掉血的时候 其他铁锁连环角色受到伤害
    // 1.一个角色求桃后死亡
    // 2.一个角色求桃后复活
    // 3.一个角色不出闪 但是没有死亡
    setStateByTieSuoTempStorage() {
        if (this.gameStatus.tieSuoTempStorage.length <= 0) {
            return
        }

        const nextTieSuoAction = this.gameStatus.tieSuoTempStorage[0];

        const targetUser = this.gameStatus.users[nextTieSuoAction.targetId];
        targetUser.reduceBlood(nextTieSuoAction.damage);
        this.gameStatus.tieSuoTempStorage.shift();
    }
}

exports.GameEngine = GameEngine;