const {getInitCards, CARD_CONFIG, CARD_TYPE} = require("../initCards");
const emitMap = require("../config/emitMap.json");

class GameEngine {
    constructor(io) {
        this.io = io;


        // TODO let logs = [];
        this.initCards = getInitCards();
        this.throwedCards = [];
        this.currentUserIndex = 0;
        this.stageNamesEN = ["start", "judge", "draw", "play", "throw", "end"];
        this.stageNamesCN = ["开始", "判定", "摸牌", "出牌", "弃牌", "结束"];
        this.stageIndex = 0;

        this.gameStatus = {
            users: {},
            stage: {},
            action: {},
            responseStages: [],
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
        return Object.values(this.gameStatus.users).find((u) => u.location == this.currentUserIndex)
    }

    goNextStage() {
        this.setGameStatusStage();
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

    setGameStatusStage() {
        if (this.gameStatus.responseStages.length > 0) {
            return
        }

        this.stageIndex++
        if (this.stageIndex >= this.stageNamesEN.length) {
            this.stageIndex = 0

            this.currentUserIndex++
            if (this.currentUserIndex >= Object.keys(this.gameStatus.users).length) {
                this.currentUserIndex = 0
            }
        }
        this.gameStatus.stage = {
            userId: this.getCurrentUser().userId,
            stageName: this.stageNamesEN[this.stageIndex],
            stageNameCN: this.stageNamesCN[this.stageIndex]
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
        // cards: gameFEgameFEStatus.selectedCards,
        //     actualCard: gameFEgameFEStatus.selectedCards[0],
        //     originId: getMyUserId(),
        //     targetId: gameFEgameFEStatus.selectedTargetUsers?.[0]?.userId,

        this.gameStatus.action = action;
        const originUser = this.gameStatus.users[action.originId]

        if (action.actualCard.CN == CARD_CONFIG.SHA.CN) {
            this.gameStatus.responseStages = [
                {
                    originId: action.targetId,
                    targetId: action.originId,
                    cardNames: [CARD_CONFIG.SHAN.CN]
                }
            ];
        } else if (action.actualCard.CN == CARD_CONFIG.TAO.CN) {
            this.gameStatus.action = null;
            if (originUser.currentBlood < originUser.maxBlood) {
                originUser.currentBlood++;
            }
        } else if ([CARD_TYPE.PLUS_HORSE, CARD_TYPE.MINUS_HORSE, CARD_TYPE.SHIELD, CARD_TYPE.WEAPON].includes(action.actualCard.type)) {
            this.gameStatus.action = null;
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

        originUser.removeCards(action.cards);
        this.throwCards(action.cards);
        this.io.emit(emitMap.REFRESH_STATUS, this.gameStatus);
    }


    addResponse(response) {
        // cards？: gameFEgameFEStatus.selectedCards,
        // actualCard？: gameFEgameFEStatus.selectedCards[0].name,
        const needResponseCardName = this.gameStatus.responseStages[0]?.cardNames?.[0];
        const curResponseStage = this.gameStatus.responseStages[0];
        const originUser = Object.values(this.gameStatus.users).find((u) => u.userId == curResponseStage.originId);
        const targetUser = Object.values(this.gameStatus.users).find((u) => u.userId == curResponseStage.targetId);

        if (needResponseCardName == CARD_CONFIG.SHAN.CN) { // 需要出的是闪
            if (response?.actualCard?.CN == CARD_CONFIG.SHAN.CN) { // 出闪了
                originUser.removeCards(response.cards);
                this.throwCards(response.cards);
                this.goToNextResponseStage();
            } else { // 没出闪
                originUser.currentBlood--;
                this.goToNextResponseStage();

                // 求桃不能直接给responseStages赋新值 因为有可能一个杀了多个人 求桃之后 其他人依然需要相应闪
                if (originUser.currentBlood <= 0) {
                    const newResponseStages = [];
                    for (let i = this.currentUserIndex; i < Object.keys(this.gameStatus.users).length; i++) {
                        const location = i % Object.keys(this.gameStatus.users).length
                        const user = Object.values(this.gameStatus.users).find((u) => u.location == location)
                        newResponseStages.push({
                            originId: user.userId,
                            targetId: curResponseStage.originId,//相应的origin 才是没有出闪需要求桃的人
                            cardNames: [CARD_CONFIG.TAO.CN]
                        })
                    }
                    this.gameStatus.responseStages = newResponseStages.concat(this.gameStatus.responseStages);
                }
            }
        } else if (needResponseCardName == CARD_CONFIG.TAO.CN) { // 需要出的是桃
            if (response?.actualCard?.CN == CARD_CONFIG.TAO.CN) { // 出桃了
                originUser.removeCards(response.cards);
                this.throwCards(response.cards);
                const targetUser = this.gameStatus.users[curResponseStage.targetId]
                targetUser.currentBlood++;
                if (targetUser.currentBlood > 0) {
                    this.goToNextResponseStage();
                }
            } else { // 没出桃
                this.goToNextResponseStage();
            }
        }

        this.io.emit(emitMap.REFRESH_STATUS, this.gameStatus);
    }

    goToNextResponseStage() {
        this.gameStatus.responseStages.shift();
    }
}

exports.GameEngine = GameEngine;