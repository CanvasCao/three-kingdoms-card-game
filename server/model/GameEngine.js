const {getInitCards} = require("../initCards");
const emitMap = require("../data/emitMap.json");

class GameEngine {
    constructor(io) {
        this.io = io;
        this.gameStatus = {
            users: {},
            stage: {},
        }


        // TODO let actions = [];// {type:'sha',cards:['1','2'],target:['1'],origin:"2"}
        // TODO let logs = [];

        this.initCards = getInitCards();
        this.throwCards = [];
        this.currentUserIndex = 0;
        this.stageNames = ["start", "judge", "draw", "play", "throw", "end"];
        this.stageIndex = 0;
    }

    startEngine() {
        this.gameStatus.stage = {
            userId: this.getCurrentUser().userId,
            stageName: this.stageNames[this.stageIndex]
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
        this.stageIndex++
        if (this.stageIndex >= this.stageNames.length) {
            this.stageIndex = 0

            this.currentUserIndex++
            if (this.currentUserIndex >= Object.keys(this.gameStatus.users).length) {
                this.currentUserIndex = 0
            }
        }
        this.gameStatus.stage = {userId: this.getCurrentUser().userId, stageName: this.stageNames[this.stageIndex]}

        // 目前只有发牌
        if (this.gameStatus.stage.stageName == 'draw') {

            // hardcode 补牌
            if (this.initCards.length < 2) {
                console.log("补牌")
                this.initCards = getInitCards()
            }

            this.getCurrentUser().cards.push(this.getOneCard())
            this.getCurrentUser().cards.push(this.getOneCard())

            // hardcode 出牌
            if (this.getCurrentUser().cards.length >= 6) {
                console.log("出牌")
                this.getCurrentUser().cards = [this.getCurrentUser().cards[4]]
            }
        }

        this.io.emit(emitMap.GO_NEXT_STAGE, this.gameStatus);
        this.io.emit(emitMap.REFRESH_STATUS, this.gameStatus);

        if (this.canAutoGoNextStage()) {
            this.goNextStage()
        }
    }


    canAutoGoNextStage() {
        return ["start", "judge", "draw", "end"].includes(this.gameStatus.stage.stageName)
    }

    getOneCard() {
        const card = JSON.parse(JSON.stringify(this.initCards.shift()))
        return card;
    }
}

exports.GameEngine = GameEngine;