const setCurrentLocationToNextLocation = (gameStatus) => {
    const filteredNotDead = Object.values(gameStatus.players).filter((u) => !u.isDead);
    if (filteredNotDead.length == 0) {
        throw new Error("Everyone is dead. Game Over")
    }
    const sorted = filteredNotDead.sort((a, b) => a.location - b.location)

    // 可能会在自己的回合自杀 所以不能找到自己再+1
    const nextPlayer = sorted.find((u) => u.location > gameStatus.currentLocation);
    if (nextPlayer) {
        gameStatus.currentLocation = nextPlayer.location
    } else {
        gameStatus.currentLocation = sorted[0].location
    }
}

exports.setCurrentLocationToNextLocation = setCurrentLocationToNextLocation;