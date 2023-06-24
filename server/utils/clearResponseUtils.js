const clearShanResponse = (gameStatus) => {
    gameStatus.shanResponse = undefined;
}

const clearSkillResponse = (gameStatus) => {
    gameStatus.skillResponse = undefined;
}

const clearNextTaoResponse = (gameStatus) => {
    gameStatus.taoResponses.shift();
}

const clearNextScrollResponse = (gameStatus) => {
    gameStatus.scrollResponses.shift();
}

const clearNextWeaponResponse = (gameStatus) => {
    gameStatus.weaponResponses.shift();
}

const clearWuxieSimultaneousResponse = (gameStatus) => {
    gameStatus.wuxieSimultaneousResponse = {
        hasWuxiePlayerIds: [],
        wuxieChain: []
    }
}

const clearAllResponses = (gameStatus) => {
    clearWuxieSimultaneousResponse(gameStatus);
    gameStatus.shanResponse = undefined;
    gameStatus.skillResponse = undefined;
    gameStatus.taoResponses = [];
    gameStatus.scrollResponses = [];
    gameStatus.weaponResponses = [];
}

exports.clearNextTaoResponse = clearNextTaoResponse;
exports.clearShanResponse = clearShanResponse;
exports.clearSkillResponse = clearSkillResponse;
exports.clearNextScrollResponse = clearNextScrollResponse;
exports.clearNextWeaponResponse = clearNextWeaponResponse;
exports.clearWuxieSimultaneousResponse = clearWuxieSimultaneousResponse;
exports.clearAllResponses = clearAllResponses;