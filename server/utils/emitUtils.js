const {Rooms} = require("../model/Rooms");
const {PLAYER_BOARD_ACTION} = require("../config/boardConfig");
const {teamMembers} = require("./roomUtils");
const {EMIT_TYPE} = require("../config/emitConfig");
const {GAME_STATUS} = require("../config/gameAndStageConfig");
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

    if (behaviour.cards?.length) {
        io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PUBLIC_CARD, {
            fromId: behaviour.originId,
            originId: behaviour.originId,
            targetId: behaviour.targetId,
            cards: behaviour.cards,
            type: ADD_TO_PUBLIC_CARD_TYPE.PLAY,
            skillKey: behaviour.skillKey,
        });
    }
}

const emitNotifyPandingPlayPublicCard = (gameStatus, pandingResultCard, player, pandingNameKey) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PUBLIC_CARD, {
        cards: [pandingResultCard],
        fromId: CARD_LOCATION.PAIDUI,
        pandingPlayerId: player.playerId,
        pandingNameKey,
        type: ADD_TO_PUBLIC_CARD_TYPE.PANDING
    });
}

const emitNotifyThrowPlayPublicCard = (gameStatus, data) => {
    // export type EmitThrowData = {
    //     cards: Card[],
    //     playerId: string,
    // }
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    const {cards, playerId} = data
    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PUBLIC_CARD, {
        cards,
        fromId: playerId,
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
        isPublic: false,
    });
}

 const emitNotifyCardBoardAction = (gameStatus, boardActionData) => {
    // export type EmitCardBoardData = {
    //     originId: string,
    //     targetId: string,
    //     card: Card,
    //     action: PlayerBoardAction,
    // }
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    const {originId, targetId, card, action} = boardActionData
    if (action == PLAYER_BOARD_ACTION.REMOVE) {
        io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PUBLIC_CARD, {
            cards: [boardActionData.card],
            fromId: boardActionData.targetId,
            type: ADD_TO_PUBLIC_CARD_TYPE.CHAI
        });
    } else {
        const isPublic = !gameStatus.players[targetId].cards.find((c) => c.cardId == card.cardId)

        io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PLAYER_CARD, {
            cards: [card],
            fromId: targetId,
            toId: originId,
            isPublic
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
        isPublic: true,
    });
}

// export type data = {
//         cards: Card[],
//         playerId: string,
//     }
const emitNotifyGetCardsFromTable = (gameStatus, data) => {
    const io = gameStatus.io;
    const roomId = gameStatus.roomId;
    io.to(roomId).emit(EMIT_TYPE.NOTIFY_ADD_TO_PLAYER_CARD, {
        cards: data.cards,
        fromId: CARD_LOCATION.TABLE,
        toId: data.playerId,
        isPublic: true,
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
exports.emitNotifyPlayPublicCard = emitNotifyPlayPublicCard;
exports.emitNotifyPandingPlayPublicCard = emitNotifyPandingPlayPublicCard;
exports.emitNotifyThrowPlayPublicCard = emitNotifyThrowPlayPublicCard;

// TO PUBLIC OR TO PLAYER
exports.emitNotifyCardBoardAction = emitNotifyCardBoardAction;

// TO PLAYER
exports.emitNotifyDrawCards = emitNotifyDrawCards;
exports.emitNotifyJieDaoWeaponOwnerChange = emitNotifyJieDaoWeaponOwnerChange;
exports.emitNotifyGetCardsFromTable = emitNotifyGetCardsFromTable;

// ADD LINES
exports.emitNotifyAddLines = emitNotifyAddLines;

exports.emitRefreshStatus = emitRefreshStatus;
exports.emitInit = emitInit;
exports.emitRejoinInit = emitRejoinInit;

exports.emitRefreshRooms = emitRefreshRooms;
exports.emitRefreshRoomPlayers = emitRefreshRoomPlayers;
