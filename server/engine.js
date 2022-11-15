// let actions = [];// {type:'sha',cards:['1','2'],target:['1'],origin:"2"}
// let logs = [];


const {initCards} = require("./initCards");
let users = [];

let userIndex = 0;
let stageIndex = 0;

let stages = [
    {"name": "draw", "timeout": 0, "userId": '22c3d181-5d60-4283-a4ce-6f2b14d772bc'},
    {"name": "end", "timeout": 2000, "userId": '22c3d181-5d60-4283-a4ce-6f2b14d772bc'},
    {"name": "draw", "timeout": 0, "userId": 'user2'},
    {"name": "end", "timeout": 2000, "userId": 'user2'},
];

const gameStatus = {
    users
}


let timoutTimer = null;
const startEngine = (io) => {
    const stage = stages[stageIndex];
    timoutTimer = setTimeout(() => {
        // hardcode stage
        stageIndex++;
        if (stageIndex == 4) {
            stageIndex = 0
        }


        io.emit(
            "message",
            JSON.stringify(stage)
        );

        if (stage.name == "draw") {
            io.emit(
                "drawCards",
                {
                    cards: [initCards[0],initCards[1]],
                    userId: stage.userId
                }
            );
        }

        startEngine(io);
    }, stage.timeout)
}


exports.startEngine = startEngine
exports.gameStatus = gameStatus