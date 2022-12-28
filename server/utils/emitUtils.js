const emitMap = require("../config/emitMap.json");
const {omit} = require("lodash")
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
    // behaviour is action/response
    const originName = users[behavior.originId].name;

    if (!behavior.targetIds && !behavior.targetId) {
        return `${originName}使用`
    }

    const targetName = behavior.targetIds ? behavior.targetIds.map((targetId) => users[targetId].name).join(' ') : users[behavior.targetId].name

    if (targetName == originName) {
        return `${originName}使用`
    } else {
        return `${originName}对${targetName}`//使用了${behavior.actualCard.CN}`
    }
}

const emitBehaviorPublicPlayCard = (io, behaviour, gameStatus) => {
    if (!behaviour) {
        return
    }

    // behaviour is action/response
    if (behaviour.cards?.[0]) {
        io.emit(emitMap.PLAY_BEHAVIOR_PUBLIC_CARD, {
            behaviour: behaviour,
            message: generateBehaviorMessage(behaviour, gameStatus.users)
        });
    }
}

const emitCardBoardPublicPlayCard = (io, data, gameStatus) => {
    // type EmitCardBoardData = {
    //     originId: string,
    //     targetId: string,
    //     card: Card,
    //     type: "REMOVE" | "MOVE",
    // }
    io.emit(emitMap.PLAY_NON_BEHAVIOR_PUBLIC_CARD, {
        cards: [data.card],
        message: `${gameStatus.users[data.targetId].name} 被 ${data.type == "REMOVE" ? "拆" : "顺"}`
    });

}
const emitPandingPublicCard = (gameStatus, pandingResultCard, user, pandingCard) => {
    gameStatus.io.emit(emitMap.PLAY_NON_BEHAVIOR_PUBLIC_CARD, {
        cards: [pandingResultCard],
        message: `${user.name}的${pandingCard.CN}判定结果`
    });
}

const emitThrowPublicCard = (gameStatus, cards, user) => {
    gameStatus.io.emit(emitMap.PLAY_NON_BEHAVIOR_PUBLIC_CARD, {
        cards: cards,
        message: `${user.name}弃牌`
    });
}

const omitGSArray = ['throwedCards', 'initCards', 'currentLocation', 'stageIndex', 'io']
const emitRefreshStatus = (gameStatus) => {
    const io = gameStatus.io;
    const omitGS = omit(gameStatus, omitGSArray)
    io.emit(emitMap.REFRESH_STATUS, omitGS); // 为了refresh页面所有元素
}

const emitInit = (gameStatus) => {
    const io = gameStatus.io;
    const omitGS = omit(gameStatus, omitGSArray)
    io.emit(emitMap.INIT, omitGS);
}

exports.shuffle = shuffle;
exports.emitBehaviorPublicPlayCard = emitBehaviorPublicPlayCard;
exports.emitCardBoardPublicPlayCard = emitCardBoardPublicPlayCard;
exports.emitPandingPublicCard = emitPandingPublicCard;
exports.emitThrowPublicCard = emitThrowPublicCard;
exports.emitRefreshStatus = emitRefreshStatus;
exports.emitInit = emitInit;