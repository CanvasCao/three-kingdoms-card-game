const {EQUIPMENT_TYPE} = require("../config/cardConfig");
const {SKILL_NAMES} = require("../config/skillsConfig");
const {EMIT_TYPE} = require("../config/emitConfig");
const {GAME_STATUS} = require("../config/gameConfig");
const {CARD_LOCATION} = require("../config/cardConfig");
const {ADD_TO_PUBLIC_CARD_TYPE} = require("../config/emitConfig");
const {omit} = require("lodash")

// TO PUBLIC EMIT
const emitNotifyPlayPublicCard = (gameStatus, behaviour) => {
    // behaviour is action/response
    if (!behaviour) {
        throw new Error("need behaviour")
    }

    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    if (behaviour.cards?.[0]) {
        io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PUBLIC_CARD, {
            fromId: behaviour.originId,
            originId: behaviour.originId,
            targetId: behaviour.targetId,
            cards: behaviour.cards,
            type: ADD_TO_PUBLIC_CARD_TYPE.PLAY,
            skillName: gameStatus?.skillResponse?.skillName
        });
    }
}

const emitNotifyPandingPlayPublicCard = (gameStatus, pandingResultCard, player, pandingName) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PUBLIC_CARD, {
        cards: [pandingResultCard],
        fromId: CARD_LOCATION.PAIDUI,
        pandingPlayerId: player.playerId,
        pandingName,
        type: ADD_TO_PUBLIC_CARD_TYPE.PANDING
    });
}

const emitNotifyThrowPlayPublicCard = (gameStatus, data, player) => {
    // EmitThrowData = {
    //     cards: Card[]
    // }
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PUBLIC_CARD, {
        cards: data.cards,
        fromId: player.playerId,
        throwPlayerId: player.playerId,
        type: ADD_TO_PUBLIC_CARD_TYPE.THROW
    });
}

// TO PLAYER EMIT
const emitNotifyDrawCards = (gameStatus, cards, player) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PLAYER_CARD, {
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
    // }
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    if (boardActionData.type == "REMOVE") {
        io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PUBLIC_CARD, {
            cards: [boardActionData.card],
            fromId: boardActionData.targetId,
            type: ADD_TO_PUBLIC_CARD_TYPE.CHAI
        });
    } else {
        io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PLAYER_CARD, {
            cards: [boardActionData.card],
            fromId: boardActionData.targetId,
            toId: boardActionData.originId,
            cardAreaType: boardActionData.cardAreaType,
        });
    }
}

const emitNotifyJieDaoWeaponOwnerChange = (gameStatus, weaponCard) => {
    const io = gameStatus.io;
    const action = gameStatus.action;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PLAYER_CARD, {
        cards: [weaponCard],
        fromId: action.targetIds[0],
        toId: action.originId,
        cardAreaType: 'EQUIPMENT',
    });
}

const emitNotifyPickWuGuCard = (gameStatus, data) => {
// export type EmitWugufengdengData = {
//         card: Card,
//         playerId: string,
//     }
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PLAYER_CARD, {
        cards: [data.card],
        fromId: CARD_LOCATION.PAIDUI,
        toId: data.playerId,
    });
}

// LINES
const emitNotifyAddLines = (gameStatus, behavior) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_LINES, {
        fromId: behavior.originId,
        toIds: behavior.targetId ? [behavior.targetId] : behavior.targetIds,
        cards: behavior.cards,
        actualCard: behavior.actualCard,
    });
}

const omitGSArray = [
    // 'throwedCards',
    'initCards',
    'currentLocation',
    'stageIndex',
    'io']
process.env.NODE_ENV == 'production' && omitGSArray.push('throwedCards')
// 只能在goToNextStage和GameEngine的handler之后调用
const emitRefreshStatus = (gameStatus) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    const omitGS = omit(gameStatus, omitGSArray)
    io.to(roomId).emit(EMIT_TYPE.REFRESH_STATUS, omitGS);
}

const emitInit = (gameStatus) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    const omitGS = omit(gameStatus, omitGSArray)
    io.to(roomId).emit(EMIT_TYPE.INIT, omitGS);
}

const emitRejoinInit = (gameStatus) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    const omitGS = omit(gameStatus, omitGSArray)
    io.to(roomId).emit(EMIT_TYPE.INIT, omitGS);
}

// room
const emitRefreshRooms = (io, rooms) => {
    const emitRooms = []
    for (var roomId in rooms) {
        emitRooms.push({
            roomId,
            players: rooms[roomId].players,
            status: rooms[roomId].gameEngine ? GAME_STATUS.PLAYING : GAME_STATUS.IDLE,
        })
    }
    io.emit(EMIT_TYPE.REFRESH_ROOMS, emitRooms);
}

const emitRefreshRoomPlayers = (io, rooms, roomId) => {
    if (!rooms[roomId].gameEngine) {
        io.to(roomId).emit(EMIT_TYPE.REFRESH_ROOM_PLAYERS, rooms[roomId].players);
    }
}

// TO PUBLIC
exports.emitNotifyPlayPublicCard = emitNotifyPlayPublicCard;
exports.emitNotifyPandingPlayPublicCard = emitNotifyPandingPlayPublicCard;
exports.emitNotifyThrowPlayPublicCard = emitNotifyThrowPlayPublicCard;

// TO PUBLIC OR TO PLAYER
exports.emitNotifyCardBoardAction = emitNotifyCardBoardAction;

// TO PLAYER
exports.emitNotifyDrawCards = emitNotifyDrawCards;
exports.emitNotifyJieDaoWeaponOwnerChange = emitNotifyJieDaoWeaponOwnerChange;
exports.emitNotifyPickWuGuCard = emitNotifyPickWuGuCard;

// ADD LINES
exports.emitNotifyAddLines = emitNotifyAddLines;

exports.emitRefreshStatus = emitRefreshStatus;
exports.emitInit = emitInit;
exports.emitRejoinInit = emitRejoinInit;

exports.emitRefreshRooms = emitRefreshRooms;
exports.emitRefreshRoomPlayers = emitRefreshRoomPlayers;
