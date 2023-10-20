const {GAME_STATUS} = require('../config/gameAndStageConfig')

class Rooms {
    constructor() {
        if (!Rooms.instance) {
            const roomNumber = 3;

            for (let roomId = 1; roomId <= roomNumber; roomId++) {
                this[roomId] = {gameEngine: null, roomPlayers: [], status: GAME_STATUS.IDLE}
            }
            Rooms.instance = this;
        }

        return Rooms.instance;
    }

    getRoom(roomId) {
        return this?.[roomId]
    }

    setRoomPlayers(roomId, val) {
        if (!this?.[roomId]?.roomPlayers) {
            return
        }
        this[roomId].roomPlayers = val
    }


    getRoomPlayers(roomId) {
        return this?.[roomId]?.roomPlayers || []
    }


    setRoomStatus(roomId, val) {
        if (!this?.[roomId]) {
            return
        }
        this[roomId].status = val
    }

    getRoomStatus(roomId) {
        return this?.[roomId]?.status || GAME_STATUS.IDLE
    }

    setRoomEngine(roomId, val) {
        if (!this?.[roomId]) {
            return
        }
        this[roomId].gameEngine = val
    }

    getRoomEngine(roomId) {
        return this?.[roomId]?.gameEngine
    }
}

exports.Rooms = Rooms;