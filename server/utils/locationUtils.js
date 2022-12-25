const setCurrentLocationToNextLocation = (gameStatus) => {
    const filteredNotDead = Object.values(gameStatus.users).filter((u) => !u.isDead);
    if (filteredNotDead.length == 0) {
        throw new Error("Everyone is dead. Game Over")
    }
    const sorted = filteredNotDead.sort((a, b) => a.location - b.location)

    // 可能会在自己的回合自杀 所以不能找到自己再+1
    const nextUser = sorted.find((u) => u.location > gameStatus.currentLocation);
    if (nextUser) {
        gameStatus.currentLocation = nextUser.location
    } else {
        gameStatus.currentLocation = sorted[0].location
    }
}

exports.setCurrentLocationToNextLocation = setCurrentLocationToNextLocation;