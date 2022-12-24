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
    actionHandler
} = require("../actionHandler");
const {
    responseHandler
} = require("../responseHandler");

class GameEngine {
    constructor(io) {
        this.io = io;


        // TODO let logs = [];
        this.initCards = getInitCards();
        this.throwedCards = [];
        this.currentLocation = 0;

        this.stageNamesEN = ["start", "judge", "draw", "play", "throw", "end"];
        this.stageNamesCN = ["开始", "判定", "摸牌", "出牌", "弃牌", "结束"];
        this.stageIndex = 0;

        this.gameStatus = {
            users: {},
            stage: {},
            action: {},

            // 基础牌
            shanResStages: [],
            taoResStages: [],

            // 锦囊
            scrollResStages: [],
            wuxieResStage: {
                hasWuxiePlayerIds: [],
                wuxieChain: []// 等待全员无懈可击
            },

            tieSuoTempStorage: [],
            // throwedCards: [],
        }

        this.userUtils = {
            getCurrentUser: () => {
                return Object.values(this.gameStatus.users).find((u) => u.location == this.currentLocation)
            },
            setCurrentLocationToNextLocation: () => {
                const filteredNotDead = Object.values(this.gameStatus.users).filter((u) => !u.isDead);
                if (filteredNotDead.length == 0) {
                    throw new Error("Everyone is dead. Game Over")
                }
                const sorted = filteredNotDead.sort((a, b) => a.location - b.location)

                // 可能会在自己的回合自杀 所以不能找到自己再+1
                const nextUser = sorted.find((u) => u.location > this.currentLocation);
                if (nextUser) {
                    this.currentLocation = nextUser.location
                } else {
                    this.currentLocation = sorted[0].location
                }
            },
            getNextShandianUser: () => {
                const filtered = Object.values(this.gameStatus.users).filter((u) => {
                    return !u.isDead && !u.pandingCards.find(c => c.CN == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN)
                });
                const sorted = filtered.sort((a, b) => a.location - b.location);
                const nextUser = sorted.find((u) => u.location > this.currentLocation);
                return nextUser ? nextUser : sorted[0]
            }
        }
        this.stageUtils = {
            goToNextStage: () => {
                this.stageIndex++
                if (this.stageIndex >= this.stageNamesEN.length) {
                    this.userUtils.getCurrentUser().resetWhenMyTurnEnds()
                    this.stageIndex = 0;
                    this.userUtils.setCurrentLocationToNextLocation();
                }
                this.gameStatus.stage = {
                    userId: this.userUtils.getCurrentUser().userId,
                    stageName: this.stageNamesEN[this.stageIndex],
                    stageNameCN: this.stageNamesCN[this.stageIndex]
                }
                emitRefreshStatus(this.io, this.gameStatus);
                this.stageUtils.tryGoNextStage();
            },
            canTryGoNextStage: () => {
                if (this.gameStatus.shanResStages.length > 0 ||
                    this.gameStatus.taoResStages.length > 0 ||
                    this.gameStatus.scrollResStages.length > 0) {
                    return false
                }
                return true
            },
            tryGoNextStage: () => {
                if (!this.stageUtils.canTryGoNextStage()) {
                    return
                }

                const user = this.userUtils.getCurrentUser();
                if (this.gameStatus.stage.stageName == 'start') {
                    this.stageUtils.goToNextStage();
                } else if (this.gameStatus.stage.stageName == 'judge') {
                    this.executePanding();
                } else if (this.gameStatus.stage.stageName == 'draw') {
                    user.addCards(this.cardUtils.getCards())
                    this.stageUtils.goToNextStage();
                } else if (this.gameStatus.stage.stageName == 'play') {
                    if (user.skipPlay) {
                        this.stageUtils.goToNextStage();
                    }
                } else if (this.gameStatus.stage.stageName == 'throw') {
                    if (!user.needThrow()) {
                        this.stageUtils.goToNextStage();
                    }
                } else if (this.gameStatus.stage.stageName == 'end') {
                    this.stageUtils.goToNextStage();
                }
                emitRefreshStatus(this.io, this.gameStatus)
            }
        }
        this.cardUtils = {
            throwCards: (cards) => {
                // gameStatus.throwedCards = gameStatus.throwedCards.concat(cards);
                this.throwedCards = this.throwedCards.concat(cards);
            },
            getCards: (number = 2) => {
                // hardcode 补牌
                if (this.initCards.length < 2) {
                    console.log("补牌")
                    this.initCards = getInitCards()
                }

                if (number > 1) {
                    let cards = [];
                    for (let i = 1; i <= number; i++) {
                        cards.push(JSON.parse(JSON.stringify(this.initCards.shift())))
                    }
                    return cards;
                } else {
                    return JSON.parse(JSON.stringify(this.initCards.shift()))
                }
            }
        }
    }

    startEngine() {
        this.gameStatus.stage = {
            userId: this.userUtils.getCurrentUser().userId,
            stageName: this.stageNamesEN[this.stageIndex]
        }
        emitInit(this.io, this.gameStatus);
        this.stageUtils.tryGoNextStage()
    }


    // socket actions
    addAction(action) {
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
            this.cardUtils.throwCards(action.cards);
        } else if (action.actualCard.CN == BASIC_CARDS_CONFIG.TAO.CN) {
            actionHandler.setStatusByTaoAction(this.gameStatus);
            this.cardUtils.throwCards(action.cards);
        } else if (CARD_TYPE.EQUIPMENT == action.actualCard.type) {
            actionHandler.setStatusByEquipmentAction(this.gameStatus);
            this.cardUtils.throwCards(action.cards);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.SHAN_DIAN.CN) {
            actionHandler.setStatusByShanDianAction(this.gameStatus);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.LE_BU_SI_SHU.CN) {
            actionHandler.setStatusByLeBuSiShuAction(this.gameStatus);
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.CN) {
            actionHandler.setStatusByWuZhongShengYouAction(this.gameStatus, this.userUtils.getCurrentUser(), this.cardUtils);
            this.cardUtils.throwCards(action.cards);
        }
        originUser.removeCards(action.cards);
        emitRefreshStatus(this.io, this.gameStatus);
    }


    // response
    addResponse(response) {
        emitBehaviorPublicPlayCard(this.io, response, this.gameStatus)
        if (this.gameStatus.taoResStages.length > 0 && response?.actualCard?.CN == BASIC_CARDS_CONFIG.SHAN.CN) {
            throw new Error("求桃的时候不能出闪")
        }

        const needResponseTao = this.gameStatus.taoResStages.length > 0;
        const needResponseShan = this.gameStatus.shanResStages.length > 0;

        if (needResponseTao) { // 需要出的是TAO
            responseHandler.setStatusByTaoResponse(this.gameStatus,
                response,
                this.cardUtils,
                this.setStateByTieSuoTempStorage.bind(this),
                this.setStatusWhenUserDie.bind(this),
                this.stageUtils);
        } else if (needResponseShan) { // 需要出的是SHAN
            responseHandler.setStatusByShanResponse(this.gameStatus,
                response,
                this.cardUtils,
                this.generateTieSuoTempStorageByShaAction.bind(this),
                this.setStateByTieSuoTempStorage.bind(this));
        }
        emitRefreshStatus(this.io, this.gameStatus);
    }

    // die handler
    setStatusWhenUserDie(user) {
        user.isDead = true;
        let throwCards = [
            ...user.cards,
            user.weaponCard,
            user.shieldCard,
            user.plusHorseCard,
            user.minusHorseCard,
            ...user.pandingCards,
        ];
        throwCards = throwCards.filter(x => !!x)
        this.cardUtils.throwCards(throwCards);
        user.resetWhenDie();

        // 之后如果还需要出闪也不用出了
        this.gameStatus.shanResStages = this.gameStatus.shanResStages.filter((rs) => rs.originId !== user.userId)
    }

    // throw actions
    handleThrowCards(data) {
        const throwCards = data.cards;
        this.userUtils.getCurrentUser().removeCards(throwCards);
        this.cardUtils.throwCards(throwCards);
        emitRefreshStatus(this.io, this.gameStatus);
        emitThrowPublicCard(this.io, throwCards, this.userUtils.getCurrentUser());
        this.stageUtils.goToNextStage();
    }

    // panding
    executePanding() {
        const user = this.userUtils.getCurrentUser();

        if (user.pandingCards.length == 0) {
            this.stageUtils.goToNextStage();
            return
        }
        if (user.pandingCards.length > 0) {
            const pandingResultCard = this.cardUtils.getCards(1);
            this.cardUtils.throwCards([pandingResultCard]);
            const pandingCard = user.pandingCards[user.pandingCards.length - 1]

            emitPandingPublicCard(this.io, pandingResultCard, user, pandingCard);

            if (pandingCard.CN == DELAY_SCROLL_CARDS_CONFIG.LE_BU_SI_SHU.CN) {
                user.removePandingCard(pandingCard);
                this.cardUtils.throwCards([pandingCard]);
                if (pandingResultCard.huase !== "♥️") {
                    user.skipPlay = true;
                }
                this.stageUtils.tryGoNextStage();// 如果还有别的判定牌会再一次回到这里
            } else if (pandingCard.CN == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN) {
                // 如果闪电移动到自己身上 且闪电判定过 直接到下回合
                if (user.judgedShandian && user.pandingCards.length == 1 && user.pandingCards[0].CN == DELAY_SCROLL_CARDS_CONFIG.SHAN_DIAN.CN) {
                    this.stageUtils.goToNextStage();
                    return;
                }

                if (pandingResultCard.huase == "♠️️" && pandingResultCard.number >= 2 && pandingResultCard.number <= 9) {
                    user.removePandingCard(pandingCard);
                    this.cardUtils.throwCards([pandingCard]);

                    user.reduceBlood(3);
                    this.generateTieSuoTempStorageByShandian();

                    if (user.currentBlood > 0) { // <0 setStateByTieSuoTempStorage的逻辑在求桃之后 如果我还活着需要立刻结算下一个人的铁锁连环
                        this.setStateByTieSuoTempStorage();
                    }
                } else {
                    const nextUser = this.userUtils.getNextShandianUser();
                    // 如果人人有闪电 那么闪电原地不动
                    user.removePandingCard(pandingCard);
                    nextUser.pandingCards.push(pandingCard);
                }
                user.judgedShandian = true;
                this.stageUtils.tryGoNextStage();// 如果还有别的判定牌会再一次回到这里
            }
        }
    }

    // 任意角色blood<=0时
    generateNewRoundQiuTaoResponseStages(qiutaoTargetUser) {
        if (qiutaoTargetUser.currentBlood > 0) {
            throw new Error("Don't need TAO")
        }

        const taoResStages = [];

        for (let i = this.currentLocation; i < this.currentLocation + Object.keys(this.gameStatus.users).length; i++) {
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
        this.generateTieSuoTempStorage(this.userUtils.getCurrentUser(), null, 3);
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