const setCurrentLocationToNextLocation = (gameStatus) => {
    const filteredNotDead = Object.values(gameStatus.players).filter((u) => !u.isDead);
    if (filteredNotDead.length == 0) {
        console.log("Everyone is dead. Game Over")
        return
    }
    const sorted = filteredNotDead.sort((a, b) => a.location - b.location)

    // 可能会在自己的回合自杀 所以不能找到自己再+1
    const nextPlayer = sorted.find((u) => u.location > gameStatus.stage.currentLocation);
    if (nextPlayer) {
        gameStatus.stage.currentLocation = nextPlayer.location
    } else {
        gameStatus.stage.currentLocation = sorted[0].location
    }
}

exports.setCurrentLocationToNextLocation = setCurrentLocationToNextLocation;