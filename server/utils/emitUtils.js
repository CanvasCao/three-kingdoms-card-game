const {Rooms} = require("../model/Rooms");
const {teamMembers} = require("./roomUtils");
const {EMIT_TYPE} = require("../config/emitConfig");
const {GAME_STATUS} = require("../config/gameAndStageConfig");
const {CARD_LOCATION} = require("../config/cardConfig");
const {ADD_TO_PUBLIC_CARD_TYPE} = require("../config/emitConfig");
const {omit} = require("lodash")

// TO PUBLIC EMIT
const emitNotifyPlayPublicCards = (gameStatus, behaviour) => {
    // behaviour is action/response
    if (!behaviour) {
        throw new Error("need behaviour")
    }

    const io = gameStatus.io;
    const roomId = gameStatus.roomId;

    if (behaviour.cards?.length) {
        io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PUBLIC_CARD, {
            fromId: behaviour.originId,
            originId: behaviour.originId,
            targetIds: behaviour.targetIds,
            cards: behaviour.cards,
            type: ADD_TO_PUBLIC_CARD_TYPE.PLAY,
            skillKey: behaviour.skillKey,
        });
    }
}

const emitNotifyPublicCards = (gameStatus, {fromId, cards, pandingPlayerId, pandingNameKey, type, skillKey}) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;

    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PUBLIC_CARD, {
        cards,
        fromId,
        pandingPlayerId,
        pandingNameKey,
        type,
        skillKey
    });
}

// TO PLAYER EMIT
const emitNotifyDrawCards = (gameStatus, player, cards) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PLAYER_CARD, {
        cards,
        fromId: CARD_LOCATION.PAIDUI,
        toId: player.playerId,
        isPublic: false,
    });
}

const emitNotifyMoveCards = (gameStatus, fromId, toId, cards, isPublic) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;

    const movingCards = Array.isArray(cards) ? cards : [cards]

    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PLAYER_CARD, {
        cards: movingCards,
        fromId,
        toId,
        isPublic
    });
}

// LINES
const emitNotifyAddLines = (gameStatus, {fromId, toIds, actualCard}) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_LINES, {
        fromId,
        toIds,
        actualCard,
    });
}

const omitGSArray = [
    'deckCards',
    'io',
]
if (process.env.NODE_ENV == 'production') {
    omitGSArray.push('log')
    omitGSArray.push('throwedCards')
    omitGSArray.push('gameStageEvent')
}

// 只能在GameEngine的handler之后调用
const emitRefreshStatus = (gameStatus) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    const omitGS = omit(gameStatus, omitGSArray)
    io.to(roomId).emit(EMIT_TYPE.REFRESH_STATUS, omitGS);


    // 如果游戏结束  帮助所有player离开socket 再emitRefreshRooms
    if (gameStatus.gameEnd) {
        let rooms = new Rooms()
        rooms.setRoomPlayers(roomId, [])
        rooms.setRoomStatus(roomId, GAME_STATUS.IDLE)
        io.socketsLeave(roomId); // 帮助所有player离开socket
        emitRefreshRooms(io)
    }
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
const emitRefreshRooms = (io) => {
    const emitRooms = []
    let rooms = new Rooms()
    for (let roomId in rooms) {
        const roomPlayers = rooms.getRoomPlayers(roomId)
        const roomStatus = rooms.getRoomStatus(roomId)
        emitRooms.push({
            roomId,
            roomPlayers,
            status: roomStatus,
        })
    }
    io.emit(EMIT_TYPE.REFRESH_ROOMS, emitRooms);
}

const emitRefreshRoomPlayers = (io, roomId) => {
    let rooms = new Rooms()
    const roomStatus = rooms.getRoomStatus(roomId)
    if ([GAME_STATUS.PLAYING].includes(roomStatus)) {
        return
    }

    const data = {
        roomId,
        roomPlayers: rooms.getRoomPlayers(roomId),
        teamMembers: teamMembers,
    }
    io.to(roomId).emit(EMIT_TYPE.REFRESH_ROOM_PLAYERS, data);
}

// TO PUBLIC
exports.emitNotifyPlayPublicCards = emitNotifyPlayPublicCards;
exports.emitNotifyPublicCards = emitNotifyPublicCards;

// TO PLAYER
exports.emitNotifyDrawCards = emitNotifyDrawCards;
exports.emitNotifyMoveCards = emitNotifyMoveCards;

// ADD LINES
exports.emitNotifyAddLines = emitNotifyAddLines;

exports.emitRefreshStatus = emitRefreshStatus;
exports.emitInit = emitInit;
exports.emitRejoinInit = emitRejoinInit;

exports.emitRefreshRooms = emitRefreshRooms;
exports.emitRefreshRoomPlayers = emitRefreshRoomPlayers;
