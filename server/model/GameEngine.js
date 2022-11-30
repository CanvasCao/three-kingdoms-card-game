const {getInitCards, CARD_CONFIG, CARD_TYPE} = require("../initCards");
const emitMap = require("../config/emitMap.json");

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
            shanResStages: [],
            taoResStages: [],
            tieSuoTempStorage: [],
            throwedCards: [],
        }
    }

    startEngine() {
        this.gameStatus.stage = {
            userId: this.getCurrentUser().userId,
            stageName: this.stageNamesEN[this.stageIndex]
        }
        this.io.emit(emitMap.INIT, this.gameStatus);

        if (this.canAutoGoNextStage()) {
            this.goNextStage()
        }
    }

    getCurrentUser() {
        return Object.values(this.gameStatus.users).find((u) => u.location == this.currentLocation)
    }

    goNextStage() {
        this.setGameStatusToNextStage();
        // 目前只有发牌
        if (this.gameStatus.stage.stageName == 'draw') {
            this.userDrawCards();
        }

        this.io.emit(emitMap.GO_NEXT_STAGE, this.gameStatus); // 只是为了debug status json
        this.io.emit(emitMap.REFRESH_STATUS, this.gameStatus); // 为了refresh页面所有元素

        if (this.canAutoGoNextStage()) {
            this.goNextStage()
        }
    }

    setGameStatusToNextStage() {
        if (this.gameStatus.shanResStages.length > 0 || this.gameStatus.taoResStages.length > 0) {
            return
        }

        this.stageIndex++
        if (this.stageIndex >= this.stageNamesEN.length) {
            this.stageIndex = 0
            this.setCurrentLocationToNextLocation();
        }
        this.gameStatus.stage = {
            userId: this.getCurrentUser().userId,
            stageName: this.stageNamesEN[this.stageIndex],
            stageNameCN: this.stageNamesCN[this.stageIndex]
        }
    }

    setCurrentLocationToNextLocation() {
        const filtedNotDead = Object.values(this.gameStatus.users).filter((u) => !u.isDead);
        if (filtedNotDead.length == 0) {
            throw new Error("Everyone is dead. Game Over")
        }
        const sorted = filtedNotDead.sort((a, b) => a.location - b.location)

        // 可能会在自己的回合自杀 所以不能找到自己再+1
        const nextUser = sorted.find((u) => u.location > this.currentLocation);
        if (nextUser) {
            this.currentLocation = nextUser.location
        } else {
            this.currentLocation = sorted[0].location
        }
    }

    userDrawCards() {
        // hardcode 补牌
        if (this.initCards.length < 2) {
            console.log("补牌")
            this.initCards = getInitCards()
        }

        this.getCurrentUser().cards.push(...this.getCards(2))

        // hardcode 出牌
        // if (this.getCurrentUser().cards.length >= 6) {
        //     console.log("出牌")
        //     this.getCurrentUser().cards = [this.getCurrentUser().cards[4]]
        // }
    }

    canAutoGoNextStage() {
        return ["start", "judge", "draw", "end"].includes(this.gameStatus.stage.stageName)
    }

    throwCards(cards) {
        this.gameStatus.throwedCards = this.gameStatus.throwedCards.concat(cards);
    }

    getCards(number = 2) {
        let cards = [];
        for (let i = 1; i <= number; i++) {
            cards.push(JSON.parse(JSON.stringify(this.initCards.shift())))
        }
        return cards;
    }

    // socket actions
    addAction(action) {
        // 桃 武器
        // {
        //     "cards": [],
        //     "actualCard": {},
        //     "originId": "22c3d181-5d60-4283-a4ce-6f2b14d772bc",
        //     "targetId": "22c3d181-5d60-4283-a4ce-6f2b14d772bc"
        // }

        // 杀
        // {
        //     "cards": [],
        //     "actualCard": {},
        //     "actions": [{
        //     "originId": "22c3d181-5d60-4283-a4ce-6f2b14d772bc",
        //     "targetId": "user2",
        //     }]
        // }

        this.gameStatus.action = action;
        const originUser = action.actions ?
            this.gameStatus.users[action.actions[0].originId] :
            this.gameStatus.users[action.originId];

        if ([CARD_CONFIG.SHA.CN, CARD_CONFIG.LEI_SHA.CN, CARD_CONFIG.HUO_SHA.CN].includes(action.actualCard.CN)
        ) {
            this.setStatusByShaAction();
            this.throwCards(action.cards);
        } else if (action.actualCard.CN == CARD_CONFIG.TAO.CN) {
            this.setStatusByTaoAction();
            this.throwCards(action.cards);
        } else if ([CARD_TYPE.PLUS_HORSE, CARD_TYPE.MINUS_HORSE, CARD_TYPE.SHIELD, CARD_TYPE.WEAPON].includes(action.actualCard.type)) {
            this.setStatusByEquipmentAction();
            this.throwCards(action.cards);
        } else if (action.actualCard.CN == CARD_CONFIG.SHAN_DIAN.CN) {
            this.setStatusByShanDianAction();
        } else if (action.actualCard.CN == CARD_CONFIG.LE_BU_SI_SHU.CN) {
            this.setStatusByLeBuSiShuAction();
        }

        originUser.removeCards(action.cards);
        this.io.emit(emitMap.REFRESH_STATUS, this.gameStatus);
    }

    // action handler
    setStatusByLeBuSiShuAction() {
        const action = this.gameStatus.action;
        const targetUser = this.gameStatus.users[action.targetId]
        targetUser.pandingCards.push(action.actualCard)
    }

    setStatusByShanDianAction() {
        const action = this.gameStatus.action;
        const originUser = this.gameStatus.users[action.originId]
        originUser.pandingCards.push(action.actualCard)
    }

    setStatusByEquipmentAction() {
        const action = this.gameStatus.action;
        const originUser = this.gameStatus.users[action.originId]

        const cardType = action.actualCard.type;
        if (cardType == CARD_TYPE.PLUS_HORSE) {
            originUser.plusHorseCard = action.actualCard;
        } else if (cardType == CARD_TYPE.MINUS_HORSE) {
            originUser.minusHorseCard = action.actualCard;
        } else if (cardType == CARD_TYPE.WEAPON) {
            originUser.weaponCard = action.actualCard;
        } else if (cardType == CARD_TYPE.SHIELD) {
            originUser.shieldCard = action.actualCard;
        }
    }

    setStatusByTaoAction() {
        const action = this.gameStatus.action;
        const originUser = this.gameStatus.users[action.originId]
        if (originUser.currentBlood < originUser.maxBlood) {
            originUser.addBlood();
        }
    }

    setStatusByShaAction() {
        const action = this.gameStatus.action;
        this.gameStatus.shanResStages = action.actions.map((a) => {
            return {
                originId: a.targetId,
                targetId: a.originId,
                cardNumber: 1,
            }
        })
    }

    // response
    addResponse(response) {
        // cards？: gameFEgameFEStatus.selectedCards,
        // actualCard？: gameFEgameFEStatus.selectedCards[0].name,
        if (this.gameStatus.taoResStages.length > 0 && response?.actualCard?.CN == CARD_CONFIG.SHAN.CN) {
            throw new Error("求桃的时候不能出闪")
        }

        const needResponseTao = this.gameStatus.taoResStages.length > 0;
        const needResponseShan = this.gameStatus.shanResStages.length > 0;

        if (needResponseTao) { // 需要出的是TAO
            this.setStatusByTaoResponse(response);
        } else if (needResponseShan) { // 需要出的是SHAN
            this.setStatusByShanResponse(response);
        }

        this.io.emit(emitMap.REFRESH_STATUS, this.gameStatus);
    }

    // response handler
    setStatusByTaoResponse(response) {
        const curTaoResStage = this.gameStatus.taoResStages[0];
        const originUser = this.gameStatus.users[curTaoResStage.originId];
        const targetUser = this.gameStatus.users[curTaoResStage.targetId];

        if (response?.actualCard?.CN == CARD_CONFIG.TAO.CN) { // 出桃了
            originUser.removeCards(response.cards);
            this.throwCards(response.cards);

            targetUser.addBlood();

            if (targetUser.currentBlood > 0) { // 出桃复活 不需要任何人再出桃
                this.gameStatus.taoResStages = [];
                this.setStateByTieSuoTempStorage();
            } else { // 出桃还没复活 更新需要下一个人提示的出桃的数量
                this.gameStatus.taoResStages.forEach((rs) => {
                    rs.cardNumber = 1 - targetUser.currentBlood;
                })
            }
        } else {
            // 没出桃 下一个人求桃
            this.clearCurrentTaoResStage();

            // 没有任何人出桃 当前角色死亡
            if (this.gameStatus.taoResStages.length == 0) {
                this.setStatusWhenUserDie(targetUser);// TODO 需要过滤掉shan response里面的tar
                this.setStateByTieSuoTempStorage();
            }
        }
    }

    setStatusByShanResponse(response) {
        const curShanResStage = this.gameStatus.shanResStages[0];
        const originUser = this.gameStatus.users[curShanResStage.originId];

        if (response?.actualCard?.CN == CARD_CONFIG.SHAN.CN) { // 出闪了
            originUser.removeCards(response.cards);
            this.throwCards(response.cards);


            curShanResStage.cardNumber--; // 吕布需要两个杀
            if (curShanResStage.cardNumber == 0) {
                this.clearCurrentShanResStage();
            } else {
                // do nothing
            }
        } else { // 没出闪
            this.clearCurrentShanResStage();

            originUser.reduceBlood();
            if (originUser.currentBlood <= 0) {
                this.generateNewRoundQiuTaoResponseStages(originUser);
            } else {
                this.setStateByTieSuoTempStorage(); // 第一个中铁锁连环且不出闪的 不会运行
            }
            this.generateTieSuoTempStorage(); // 只有第一个中铁锁连环且不出闪的 会运行
        }
    }

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
        this.throwCards(throwCards);
        user.reset();
    }

    clearCurrentShanResStage() {
        this.gameStatus.shanResStages.shift();
    }

    clearCurrentTaoResStage() {
        this.gameStatus.taoResStages.shift();
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
                newResponseStages.push({
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
    generateTieSuoTempStorage() {
        // 只考虑火杀雷杀
        const batchAction = this.gameStatus.action;
        const actualCard = batchAction.actualCard;
        // const action = batchAction.actions ? batchAction.actions[0] : batchAction;
        const firstAttributeAction = batchAction.actions.find((a) => {
            const targetUser = this.gameStatus.users[a.targetId];
            return targetUser.isTieSuo && actualCard.attribute;
        })

        // 没有对任何人造成属性伤害
        if (!firstAttributeAction) {
            return
        }

        const firstAttributeActionTargetUserId = firstAttributeAction.targetId;
        const firstLocation = this.gameStatus.users[firstAttributeActionTargetUserId].location;
        const tieSuoTempStorage = []
        for (let i = firstLocation; i < firstLocation + Object.keys(this.gameStatus.users).length; i++) {
            const modLocation = i % Object.keys(this.gameStatus.users).length;
            const user = Object.values(this.gameStatus.users).find((u) => u.location == modLocation);
            if (user.isTieSuo && firstAttributeAction.targetId !== user.userId) { // 除了第一个命中的 其他人都要进 tieSuoTempStorage
                tieSuoTempStorage.push(
                    {
                        damage: 1,
                        targetId: user.userId,
                        originId: firstAttributeAction.originId,
                        cards: firstAttributeAction.cards,
                        actualCard: firstAttributeAction.actualCard,
                    }
                )
            }
        }

        this.resetTieSuo();
        this.gameStatus.tieSuoTempStorage = tieSuoTempStorage;
    }

    // 掉血的时候执行
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
        if (targetUser.currentBlood <= 0) {
            this.generateNewRoundQiuTaoResponseStages(targetUser);
        }
        this.gameStatus.tieSuoTempStorage.shift();
    }
}

exports.GameEngine = GameEngine;