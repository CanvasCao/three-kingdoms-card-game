// let actions = [];// {type:'sha',cards:['1','2'],target:['1'],origin:"2"}
// let logs = [];


const {getInitCards} = require("./initCards");
let initCards = getInitCards();
const throwCards = [];
let users = [];
let currentUserIndex = 0;
let stages = ["start", "judge", "draw", "play", "throw", "end"];
let stageIndex = 0;

const gameStatus = {
    users,
    stage: {},
}

const startEngine = (io) => {
    gameStatus.stage = {userId: users[currentUserIndex].userId, stageName: stages[stageIndex]}
    io.emit("goNextStage", gameStatus);

    if (canAutoGoNextStage()) {
        goNextStage(io)
    }
}

const goNextStage = (io) => {
    stageIndex++
    if (stageIndex >= stages.length) {
        stageIndex = 0

        currentUserIndex++
        if (currentUserIndex >= users.length) {
            currentUserIndex = 0
        }
    }
    gameStatus.stage = {userId: users[currentUserIndex].userId, stageName: stages[stageIndex]}

    // 目前只有发牌
    if (gameStatus.stage.stageName == 'draw') {
        if (initCards.length < 2) {
            initCards = getInitCards()
        }

        gameStatus.users[currentUserIndex].cards.push(JSON.parse(JSON.stringify(initCards.pop())))
        gameStatus.users[currentUserIndex].cards.push(JSON.parse(JSON.stringify(initCards.pop())))

        // hardcode出牌
        if (gameStatus.users[currentUserIndex].cards.length >= 6) {
            gameStatus.users[currentUserIndex].cards = [gameStatus.users[currentUserIndex].cards[4],]
        }
    }

    io.emit("goNextStage", gameStatus);
    io.emit("needRefreshStatus", gameStatus);

    if (canAutoGoNextStage()) {
        goNextStage(io)
    }
}

const canAutoGoNextStage = () => {
    return ["start", "judge", "draw", "end"].includes(gameStatus.stage.stageName)
}

module.exports = {
    gameStatus,
    startEngine,
    goNextStage
}
