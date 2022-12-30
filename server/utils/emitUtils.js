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

const generateBehaviorMessage = (behavior, players) => {
    // behaviour is action/response
    const originName = players[behavior.originId].name;

    if (!behavior.targetIds && !behavior.targetId) {
        return `${originName}使用`
    }

    if (behavior.targetIds) {
        return `${originName}使用`
    }

    const targetName = players[behavior.targetId].name

    if (targetName == originName) {
        return `${originName}使用`
    } else {
        return `${originName}对${targetName}`//使用了${behavior.actualCard.CN}`
    }
}

const emitNotifyPlayPublicCard = (io, behaviour, gameStatus) => {
    // behaviour is action/response
    if (!behaviour) {
        throw new Error("need behaviour")
    }

    if (behaviour.cards?.[0]) {
        io.emit(emitMap.NOTIFY_ADD_PUBLIC_CARD, {
            behaviour: behaviour,
            originIndexes: behaviour.selectedIndexes,
            message: generateBehaviorMessage(behaviour, gameStatus.players)
        });
    }
}

const emitNotifyCardBoardPlayPublicCard = (io, data, gameStatus) => {
    // 顺拆 有originId和targetId 但是为了前端不画箭头 不传originId和targetId
    // type EmitCardBoardData = {
    //     originId: string,
    //     targetId: string,
    //     card: Card,
    //     type: "REMOVE" | "MOVE",

    // selectedIndex: number,
    // }

    if (data.type == "REMOVE") {
        // behaviour: EmitActionData | EmitResponseData;
        // originIndexes: number[],
        //     message: string;
        io.emit(emitMap.NOTIFY_ADD_PUBLIC_CARD, {
            behaviour: {
                cards: [data.card],
                originId: data.originId
            },
            originIndexes: [data.selectedIndex],
            message: `${gameStatus.players[data.targetId].name} 被拆`
        });
    } else {
        // fromId: string,
        //     toId: string,
        //     cards: Card[],
        //     originIndexes: number[],
        //     message: never;
        io.emit(emitMap.NOTIFY_ADD_OWNER_CHANGE_CARD, {
            fromId: data.targetId,
            toId: data.originId,
            originIndexes: [data.selectedIndex],
        });
    }


}
const emitNotifyPandingPlayPublicCard = (gameStatus, pandingResultCard, player, pandingCard) => {
    gameStatus.io.emit(emitMap.NOTIFY_ADD_PUBLIC_CARD, {
        behaviour: {
            cards: [pandingResultCard],
            originId: '牌堆'
            // 判定牌打出没有来源
        },
        message: `${player.name}的${pandingCard.CN}判定结果`
    });
}

const emitNotifyThrowPlayPublicCard = (gameStatus, data, player) => {
    // EmitThrowData = {
    //     cards: Card[]
    //
    //     selectedIndexes: number[],
    // }
    gameStatus.io.emit(emitMap.NOTIFY_ADD_PUBLIC_CARD, {
        behaviour: {
            cards: data.cards,
            originId: player.playerId,
        },
        originIndexes: data.selectedIndexes,
        message: `${player.name}弃牌`
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
exports.emitNotifyPlayPublicCard = emitNotifyPlayPublicCard;
exports.emitNotifyCardBoardPlayPublicCard = emitNotifyCardBoardPlayPublicCard;
exports.emitNotifyPandingPlayPublicCard = emitNotifyPandingPlayPublicCard;
exports.emitNotifyThrowPlayPublicCard = emitNotifyThrowPlayPublicCard;
exports.emitRefreshStatus = emitRefreshStatus;
exports.emitInit = emitInit;