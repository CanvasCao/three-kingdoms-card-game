const emitMap = require("../config/emitMap.json");

const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

const generateBehaviorMessage = (behavior, users) => {
    // {
    //     "cards": [],
    //     "actualCard": {},
    //     "originId": "22c3d181-5d60-4283-a4ce-6f2b14d772bc",
    //     "targetId": "22c3d181-5d60-4283-a4ce-6f2b14d772bc"
    //     "actions": [{
    //     "originId": "22c3d181-5d60-4283-a4ce-6f2b14d772bc",
    //     "targetId": "user2",
    //     }]
    // }
    const targetName = behavior.actions ? behavior.actions.map((a) => users[a.targetId].name).join(' ') : users?.[behavior?.targetId]?.name
    const originName = behavior.actions ? users[behavior.actions[0].originId].name : users[behavior.originId].name;

    return targetName ? `${originName}对${targetName}使用了${behavior.actualCard.CN}` : `${originName}使用了${behavior.actualCard.CN}`
}

const emitBehaviorPublicPlayCard = (io, behaviour,gameStatus) => {
    // behaviour is action/response
    if (behaviour.cards?.[0]) {
        io.emit(emitMap.PLAY_PUBLIC_CARD, {
            cards: behaviour.cards,
            message: generateBehaviorMessage(behaviour, gameStatus.users)
        });
    }
}

const emitPandingPublicCard=(io,card)=>{
    io.emit(emitMap.PLAY_PUBLIC_CARD, {
        cards: [card],
        message: `判定结果为${pandingResultCard.huase}${pandingResultCard.number}`
    });
}
const emitRefreshStatus = (io, gameStatus) => {
    io.emit(emitMap.REFRESH_STATUS, gameStatus); // 为了refresh页面所有元素
}

const emitInit = (io, gameStatus) => {
    io.emit(emitMap.INIT, gameStatus);
}

exports.shuffle = shuffle;
exports.generateBehaviorMessage = generateBehaviorMessage;
exports.emitBehaviorPublicPlayCard = emitBehaviorPublicPlayCard;
exports.emitRefreshStatus = emitRefreshStatus;
exports.emitPandingPublicCard = emitPandingPublicCard;
exports.emitInit = emitInit;