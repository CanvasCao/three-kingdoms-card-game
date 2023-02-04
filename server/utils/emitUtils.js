const {GAME_STATUS} = require("../config/gameConfig");
const {CARD_LOCATION} = require("../config/cardConfig");
const emitMap = require("../config/emitMap.json");
const {omit} = require("lodash")

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

// TO PUBLIC EMIT
const emitNotifyPlayPublicCard = (gameStatus, behaviour) => {
    // behaviour is action/response
    if (!behaviour) {
        throw new Error("need behaviour")
    }

    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    if (behaviour.cards?.[0]) {
        io.to(roomId).emit(emitMap.NOTIFY_ADD_TO_PUBLIC_CARD, {
            fromId: behaviour.originId,
            cards: behaviour.cards,
            originIndexes: behaviour.selectedIndexes,
            message: generateBehaviorMessage(behaviour, gameStatus.players)
        });
    }
}

const emitNotifyPandingPlayPublicCard = (gameStatus, pandingResultCard, player, pandingCard) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(emitMap.NOTIFY_ADD_TO_PUBLIC_CARD, {
        cards: [pandingResultCard],
        fromId: CARD_LOCATION.PAIDUI,
        message: `${player.name}的${pandingCard.CN}判定结果`
    });
}

const emitNotifyThrowPlayPublicCard = (gameStatus, data, player) => {
    // EmitThrowData = {
    //     cards: Card[]
    //     selectedIndexes: number[],
    // }
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(emitMap.NOTIFY_ADD_TO_PUBLIC_CARD, {
        cards: data.cards,
        fromId: player.playerId,
        originIndexes: data.selectedIndexes,
        message: `${player.name}弃牌`
    });
}

// TO PLAYER EMIT
const emitNotifyDrawCards = (gameStatus, cards, player) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(emitMap.NOTIFY_ADD_TO_PLAYER_CARD, {
        cards,
        fromId: CARD_LOCATION.PAIDUI,
        toId: player.playerId,
    });
}

const emitNotifyCardBoardAction = (gameStatus, boardActionData) => {
    // type EmitCardBoardData = {
    //     originId: string,
    //     targetId: string,
    //     card: Card,
    //     cardAreaType: CardAreaType
    //     type: "REMOVE" | "MOVE",

    // selectedIndex: number,
    // }
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    if (boardActionData.type == "REMOVE") {
        io.to(roomId).emit(emitMap.NOTIFY_ADD_TO_PUBLIC_CARD, {
            cards: [boardActionData.card],
            fromId: boardActionData.targetId,
            originIndexes: [boardActionData.selectedIndex],
            message: `${gameStatus.players[boardActionData.targetId].name} 被拆`
        });
    } else {
        io.to(roomId).emit(emitMap.NOTIFY_ADD_TO_PLAYER_CARD, {
            cards: [boardActionData.card],
            fromId: boardActionData.targetId,
            toId: boardActionData.originId,
            cardAreaType: boardActionData.cardAreaType,
            originIndexes: [boardActionData.selectedIndex],
        });
    }
}

const emitNotifyJieDaoWeaponOwnerChange = (gameStatus, action, weaponCard) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(emitMap.NOTIFY_ADD_TO_PLAYER_CARD, {
        cards: [weaponCard],
        fromId: action.targetIds[0],
        toId: action.originId,
        cardAreaType: 'equipment',
        originIndexes: action.originIndexes,
    });
}

const emitNotifyPickWuGuCard = (gameStatus, data) => {
// export type EmitWugufengdengData = {
//         card: Card,
//         playerId: string,
//     }
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(emitMap.NOTIFY_ADD_TO_PLAYER_CARD, {
        cards: [data.card],
        fromId: CARD_LOCATION.PAIDUI,
        toId: data.playerId,
    });
}

// LINES
const emitNotifyAddLines = (gameStatus, behavior) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(emitMap.NOTIFY_ADD_LINES, {
        fromId: behavior.originId,
        toIds: behavior.targetId ? [behavior.targetId] : behavior.targetIds,
        cards: behavior.cards,
        actualCard: behavior.actualCard,
    });
}

const omitGSArray = ['throwedCards', 'initCards', 'currentLocation', 'stageIndex', 'io']

// WHOLE STATUS
// 只能在goToNextStage调用 和GameEngine的handler之后调用
const emitRefreshStatus = (gameStatus) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    const omitGS = omit(gameStatus, omitGSArray)
    io.to(roomId).emit(emitMap.REFRESH_STATUS, omitGS);
}

const emitInit = (gameStatus) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    const omitGS = omit(gameStatus, omitGSArray)
    io.to(roomId).emit(emitMap.INIT, omitGS);
}

// room
const emitRefreshRooms = (io, rooms) => {
    io.emit(emitMap.REFRESH_ROOMS, [
            {roomId: 1, players: rooms[1].players, status: rooms[1].status},
            {roomId: 2, players: rooms[2].players, status: rooms[2].status}
        ]
    );
}

const emitRefreshRoomPlayers = (io, rooms, roomId) => {
    if (!rooms[roomId].gameEngine) {
        io.to(roomId).emit(emitMap.REFRESH_ROOM_PLAYERS, rooms[roomId].players);
    }
}

exports.emitNotifyPlayPublicCard = emitNotifyPlayPublicCard;
exports.emitNotifyPandingPlayPublicCard = emitNotifyPandingPlayPublicCard;
exports.emitNotifyThrowPlayPublicCard = emitNotifyThrowPlayPublicCard;

exports.emitNotifyDrawCards = emitNotifyDrawCards;
exports.emitNotifyCardBoardAction = emitNotifyCardBoardAction;
exports.emitNotifyJieDaoWeaponOwnerChange = emitNotifyJieDaoWeaponOwnerChange;
exports.emitNotifyPickWuGuCard = emitNotifyPickWuGuCard;

exports.emitNotifyAddLines = emitNotifyAddLines;

exports.emitRefreshStatus = emitRefreshStatus;
exports.emitInit = emitInit;

exports.emitRefreshRooms = emitRefreshRooms;
exports.emitRefreshRoomPlayers = emitRefreshRoomPlayers;
