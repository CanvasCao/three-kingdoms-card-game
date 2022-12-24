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
    const targetName = behavior.actions ? behavior.actions.map((a) => users[a.targetId].name).join(' ') : users?.[behavior?.targetId]?.name
    const originName = behavior.actions ? users[behavior.actions[0].originId].name : users[behavior.originId].name;

    return targetName ? `${originName}对${targetName}使用了${behavior.actualCard.CN}` : `${originName}使用了${behavior.actualCard.CN}`
}

const emitBehaviorPublicPlayCard = (io, behaviour, gameStatus) => {
    if (!behaviour) {
        return
    }

    // behaviour is action/response
    if (behaviour.cards?.[0]) {
        io.emit(emitMap.PLAY_PUBLIC_CARD, {
            cards: behaviour.cards,
            message: generateBehaviorMessage(behaviour, gameStatus.users)
        });
    }
}

const emitPandingPublicCard = (io, card, user, pandingCard) => {
    io.emit(emitMap.PLAY_PUBLIC_CARD, {
        cards: [card],
        message: `${user.name}的${pandingCard.CN}判定结果为${card.huase}${card.number}`
    });
}

const emitThrowPublicCard = (io, cards, user) => {
    io.emit(emitMap.PLAY_PUBLIC_CARD, {
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
exports.generateBehaviorMessage = generateBehaviorMessage;
exports.emitBehaviorPublicPlayCard = emitBehaviorPublicPlayCard;
exports.emitPandingPublicCard = emitPandingPublicCard;
exports.emitThrowPublicCard = emitThrowPublicCard;
exports.emitRefreshStatus = emitRefreshStatus;
exports.emitInit = emitInit;