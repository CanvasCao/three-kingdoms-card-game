const {getCurrentPlayer} = require("./playerUtils");

const resetTieSuo = (gameStatus) => {
    Object.values(gameStatus.players).forEach((player) => {
        player.isTieSuo = false;
    })
}

const generateTieSuoTempStorage = (gameStatus, firstAttributeDamageTargetPlayer, firstAttributeAction, damage) => {
    const firstLocation = firstAttributeDamageTargetPlayer.location;
    const tieSuoTempStorage = []
    for (let i = firstLocation; i < firstLocation + Object.keys(gameStatus.players).length; i++) {
        const modLocation = i % Object.keys(gameStatus.players).length;
        const player = Object.values(gameStatus.players).find((u) => u.location == modLocation);
        if (player.isTieSuo && !player.isDead && firstAttributeDamageTargetPlayer.playerId !== player.playerId) { // 除了第一个命中的 其他人都要进 tieSuoTempStorage
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
            tieSuoTempStorage.push(tempItem)
        }
    }

    resetTieSuo(gameStatus);
    gameStatus.tieSuoTempStorage = tieSuoTempStorage;
}

// 属性杀没出闪的时候需要
const generateTieSuoTempStorageByShaAction = (gameStatus) => {
    const action = gameStatus.action;
    const actualCard = action.actualCard;
    if (!actualCard.attribute) {
        return;
    }

    const firstAttributeAction = action.targetIds.find((targetId) => {
        const targetPlayer = gameStatus.players[targetId];
        return targetPlayer.isTieSuo;
    })

    // 没有任何人是铁锁状态
    if (!firstAttributeAction) {
        return
    }

    const firstAttributeActionTargetPlayerId = firstAttributeAction.targetId;
    const firstAttributeActionTargetPlayer = gameStatus.players[firstAttributeActionTargetPlayerId]
    generateTieSuoTempStorage(gameStatus, firstAttributeActionTargetPlayer, firstAttributeAction, 1);
}

const generateTieSuoTempStorageByShandian = (gameStatus) => {
    generateTieSuoTempStorage(gameStatus, getCurrentPlayer(gameStatus), null, 3);
}

// TODO 任何响应时候都执行setGameStatusByTieSuoTempStorage
// 一个角色掉血的时候 其他铁锁连环角色受到伤害
// 1.一个角色求桃后死亡
// 2.一个角色求桃后复活
// 3.一个角色不出闪 但是没有死亡
// 4.一个角色被闪电命中 但是没有死亡
const setGameStatusByTieSuoTempStorage = (gameStatus) => {
    if (gameStatus.tieSuoTempStorage.length <= 0) {
        return
    }

    const nextTieSuoAction = gameStatus.tieSuoTempStorage[0];

    const targetPlayer = gameStatus.players[nextTieSuoAction.targetId];
    targetPlayer.reduceBlood(nextTieSuoAction.damage);
    gameStatus.tieSuoTempStorage.shift();
}

exports.generateTieSuoTempStorageByShaAction = generateTieSuoTempStorageByShaAction;
exports.generateTieSuoTempStorageByShandian = generateTieSuoTempStorageByShandian;
exports.setGameStatusByTieSuoTempStorage = setGameStatusByTieSuoTempStorage;