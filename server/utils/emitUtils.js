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
            fromId: behaviour.originId,
            cards: behaviour.cards,
            originIndexes: behaviour.selectedIndexes,
            message: generateBehaviorMessage(behaviour, gameStatus.players)
        });
    }
}

const emitNotifyPandingPlayPublicCard = (gameStatus, pandingResultCard, player, pandingCard) => {
    gameStatus.io.emit(emitMap.NOTIFY_ADD_PUBLIC_CARD, {
        cards: [pandingResultCard],
        fromId: '牌堆',
        message: `${player.name}的${pandingCard.CN}判定结果`
    });
}

const emitNotifyThrowPlayPublicCard = (gameStatus, data, player) => {
    // EmitThrowData = {
    //     cards: Card[]
    //     selectedIndexes: number[],
    // }
    gameStatus.io.emit(emitMap.NOTIFY_ADD_PUBLIC_CARD, {
        cards: data.cards,
        fromId: player.playerId,
        originIndexes: data.selectedIndexes,
        message: `${player.name}弃牌`
    });
}

const emitNotifyCardBoardAction = (io, boardActionData, gameStatus) => {
    // type EmitCardBoardData = {
    //     originId: string,
    //     targetId: string,
    //     card: Card,
    //     cardAreaType: CardAreaType
    //     type: "REMOVE" | "MOVE",

    // selectedIndex: number,
    // }

    if (boardActionData.type == "REMOVE") {
        io.emit(emitMap.NOTIFY_ADD_PUBLIC_CARD, {
            cards: [boardActionData.card],
            fromId: boardActionData.targetId,
            originIndexes: [boardActionData.selectedIndex],
            message: `${gameStatus.players[boardActionData.targetId].name} 被拆`
        });
    } else {
        io.emit(emitMap.NOTIFY_ADD_OWNER_CHANGE_CARD, {
            cards: [boardActionData.card],
            fromId: boardActionData.targetId,
            toId: boardActionData.originId,
            cardAreaType: boardActionData.cardAreaType,
            originIndexes: [boardActionData.selectedIndex],
        });
    }
}

const emitNotifyJieDaoWeaponOwnerChange = (io, action, weaponCard) => {
    io.emit(emitMap.NOTIFY_ADD_OWNER_CHANGE_CARD, {
        cards: [weaponCard],
        fromId: action.targetIds[0],
        toId: action.originId,
        cardAreaType: 'equipment',
        originIndexes: action.originIndexes,
    });
}

const emitNotifyWuGuCardChange = (io, data) => {
// export type EmitWugufengdengData = {
//         card: Card,
//         playerId: string,
//     }
    io.emit(emitMap.NOTIFY_ADD_OWNER_CHANGE_CARD, {
        cards: [data.card],
        fromId: '牌堆',
        toId: data.playerId,
    });
}

const emitNotifyAddLines = (io, behavior) => {
    io.emit(emitMap.NOTIFY_ADD_LINES, {
        fromId: behavior.originId,
        toIds: behavior.targetId ? [behavior.targetId] : behavior.targetIds,
        cards: behavior.cards,
        actualCard: behavior.actualCard,
    });
}

const omitGSArray = ['throwedCards', 'initCards', 'currentLocation', 'stageIndex', 'io']

// emitRefreshStatus
// 只能在goToNextStage调用 和GameEngine的handler之后调用
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
exports.emitNotifyPandingPlayPublicCard = emitNotifyPandingPlayPublicCard;
exports.emitNotifyThrowPlayPublicCard = emitNotifyThrowPlayPublicCard;

exports.emitNotifyCardBoardAction = emitNotifyCardBoardAction;
exports.emitNotifyJieDaoWeaponOwnerChange = emitNotifyJieDaoWeaponOwnerChange;
exports.emitNotifyWuGuCardChange = emitNotifyWuGuCardChange;
exports.emitNotifyAddLines = emitNotifyAddLines;

exports.emitRefreshStatus = emitRefreshStatus;
exports.emitInit = emitInit;