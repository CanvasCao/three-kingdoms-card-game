// let actions = [];// {type:'sha',cards:['1','2'],target:['1'],origin:"2"}
// let logs = [];


const {initCards} = require("./initCards");
let users = [];
let currentUserIndex = 0;
let stages = ["start", "judge", "draw", "play", "throw", "end"];
let stageIndex = 0;

const gameStatus = {
    users,
    stage: {},
}

const getStageEmitAction = () => {
    if (gameStatus.stage.stageName == 'draw') {
        return {
            actionName: 'drawCards',
            actionData: {
                cards: [initCards[0], initCards[1]],
                userId: gameStatus.stage.userId
            }
        }
    }
    return {}
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
    io.emit("goNextStage", gameStatus);

    // 目前只有发牌
    const stageEmitAction = getStageEmitAction()
    io.emit(stageEmitAction.actionName, stageEmitAction.actionData);

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
