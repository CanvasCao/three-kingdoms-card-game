const {getInitCards, CARD_CONFIG,CARD_TYPE} = require("../initCards");
const emitMap = require("../config/emitMap.json");
const responseCardsConfig = require("../config/responseCardsConfig.json");

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
        return Object.values(this.gameStatus.users).find((u) => u.index == this.currentUserIndex)
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
                    userId: action.targetId,
                    cardNames: responseCardsConfig.responseCardMap[action.actualCard.CN]
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
        // originId: getMyUserId(),

        const originUser = this.gameStatus.users[response.originId]

        if (response.cards) {
            originUser.removeCards(response.cards);
            this.throwCards(response.cards);
        } else {
            originUser.currentBlood--;
        }


        this.gameStatus.responseStages.shift();
        if (this.gameStatus.responseStages.length <= 0) {
            this.gameStatus.action = null;
        }

        this.io.emit(emitMap.REFRESH_STATUS, this.gameStatus);
    }

}

exports.GameEngine = GameEngine;