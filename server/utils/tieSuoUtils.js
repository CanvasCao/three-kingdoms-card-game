const {getCurrentPlayer, getAllPlayersStartFromFirstLocation} = require("./playerUtils");

const resetTieSuo = (gameStatus) => {
    Object.values(gameStatus.players).forEach((player) => {
        player.isTieSuo = false;
    })
}

const generateTieSuoTempStorage = (gameStatus, firstAttributeDamageTargetPlayer, firstAttributeAction, damage) => {
    const players = getAllPlayersStartFromFirstLocation(gameStatus, getCurrentPlayer(gameStatus).location)
    gameStatus.tieSuoTempStorage = players
        .filter(player => player.playerId !== firstAttributeDamageTargetPlayer.playerId && player.isTieSuo)
        .map((player) => {
            let tempItem = {
                damage,
                targetId: player.playerId,
            }
            if (firstAttributeAction) { // 如果杀是来源
                tempItem = {
                    ...tempItem,
                    originId: firstAttributeAction.originId,
                    cards: firstAttributeAction.cards,
                    actualCard: firstAttributeAction.actualCard,
                }
            }
            return tempItem
        })
    resetTieSuo(gameStatus);
}

// 属性杀没出闪的时候需要
const generateTieSuoTempStorageByShaAction = (gameStatus) => {
    const action = gameStatus.action;
    const actualCard = action.actualCard;
    if (!actualCard.attribute) {
        return;
    }

    const firstAttributeTargetId = action.targetIds.find((targetId) => {
        const targetPlayer = gameStatus.players[targetId];
        return targetPlayer.isTieSuo;
    })

    // 没有任何人是铁锁状态
    if (!firstAttributeTargetId) {
        return
    }

    const firstAttributeActionTargetPlayer = gameStatus.players[firstAttributeTargetId]
    generateTieSuoTempStorage(gameStatus, firstAttributeActionTargetPlayer, action, 1);
}

const generateTieSuoTempStorageByShandian = (gameStatus) => {
    generateTieSuoTempStorage(gameStatus, getCurrentPlayer(gameStatus), null, 3);
}

const setGameStatusByTieSuoTempStorage = (gameStatus) => {
    const nextTieSuoAction = gameStatus.tieSuoTempStorage[0];

    const targetPlayer = gameStatus.players[nextTieSuoAction.targetId];
    targetPlayer.reduceBlood(nextTieSuoAction.damage);
    gameStatus.tieSuoTempStorage.shift();
}

exports.generateTieSuoTempStorageByShaAction = generateTieSuoTempStorageByShaAction;
exports.generateTieSuoTempStorageByShandian = generateTieSuoTempStorageByShandian;
exports.setGameStatusByTieSuoTempStorage = setGameStatusByTieSuoTempStorage;