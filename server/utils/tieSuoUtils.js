const {getCurrentUser} = require("./userUtils");

const resetTieSuo = (gameStatus) => {
    Object.values(gameStatus.users).forEach((user) => {
        user.isTieSuo = false;
    })
}

const generateTieSuoTempStorage = (gameStatus, firstAttributeDamageTargetUser, firstAttributeAction, damage) => {
    const firstLocation = firstAttributeDamageTargetUser.location;
    const tieSuoTempStorage = []
    for (let i = firstLocation; i < firstLocation + Object.keys(gameStatus.users).length; i++) {
        const modLocation = i % Object.keys(gameStatus.users).length;
        const user = Object.values(gameStatus.users).find((u) => u.location == modLocation);
        if (user.isTieSuo && !user.isDead && firstAttributeDamageTargetUser.userId !== user.userId) { // 除了第一个命中的 其他人都要进 tieSuoTempStorage
            let tempItem = {
                damage,
                targetId: user.userId,
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
        const targetUser = gameStatus.users[targetId];
        return targetUser.isTieSuo;
    })

    // 没有任何人是铁锁状态
    if (!firstAttributeAction) {
        return
    }

    const firstAttributeActionTargetUserId = firstAttributeAction.targetId;
    const firstAttributeActionTargetUser = gameStatus.users[firstAttributeActionTargetUserId]
    generateTieSuoTempStorage(gameStatus, firstAttributeActionTargetUser, firstAttributeAction, 1);
}

const generateTieSuoTempStorageByShandian = (gameStatus) => {
    generateTieSuoTempStorage(gameStatus, getCurrentUser(gameStatus), null, 3);
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

    const targetUser = gameStatus.users[nextTieSuoAction.targetId];
    targetUser.reduceBlood(nextTieSuoAction.damage);
    gameStatus.tieSuoTempStorage.shift();
}

exports.generateTieSuoTempStorageByShaAction = generateTieSuoTempStorageByShaAction;
exports.generateTieSuoTempStorageByShandian = generateTieSuoTempStorageByShandian;
exports.setGameStatusByTieSuoTempStorage = setGameStatusByTieSuoTempStorage;