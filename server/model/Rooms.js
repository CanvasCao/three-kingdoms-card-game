class Rooms {
    constructor() {
        if (!Rooms.instance) {
            const roomNumber = 3;
            this.rooms = {};
            for (let i = 1; i <= roomNumber; i++) {
                this.rooms[i] = {gameEngine: null, roomPlayers: []}
            }
            Rooms.instance = this;
        }

        return Rooms.instance;
    }
}

exports.Rooms = Rooms;