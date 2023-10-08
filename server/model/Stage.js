const {STAGE_NAME} = require("../config/gameAndStageConfig");

class Stage {
    constructor() {
        this.stageName = STAGE_NAME.START
        this.currentLocation = 0
        this.roundNumber = 0
    }

    getRoundNumber() {
        return this.roundNumber;
    }

    getStageName() {
        return this.stageName;
    }

    setStageName(stageName) {
        this.stageName = stageName;
    }

    getCurrentLocation() {
        return this.currentLocation;
    }

    setCurrentLocationToNextLocation(players) {
        const filteredNotDead = Object.values(players).filter((u) => !u.isDead);
        if (filteredNotDead.length == 0) {
            console.log("Everyone is dead. Game Over")
            return
        }
        const sorted = filteredNotDead.sort((a, b) => a.location - b.location)

        // 可能会在自己的回合自杀 所以不能找到自己再+1
        const nextPlayer = sorted.find((u) => u.location > this.currentLocation);
        if (nextPlayer) {
            this.currentLocation = nextPlayer.location
        } else {
            // 新的一轮
            this.roundNumber++
            this.currentLocation = sorted[0].location
        }
    }
}

exports.Stage = Stage;