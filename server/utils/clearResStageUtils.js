const clearShanResponse = (gameStatus) => {
    gameStatus.shanResponse = undefined;
}

const clearSkillResponse = (gameStatus) => {
    gameStatus.skillResponse = undefined;
}

const clearNextTaoStage = (gameStatus) => {
    gameStatus.taoResStages.shift();
}

const clearNextScrollStage = (gameStatus) => {
    gameStatus.scrollResStages.shift();
}

const clearNextWeaponStage = (gameStatus) => {
    gameStatus.weaponResStages.shift();
}

const clearWuxieResStage = (gameStatus) => {
    gameStatus.wuxieSimultaneousResStage = {
        hasWuxiePlayerIds: [],
        wuxieChain: []
    }
}

const clearAllResStages = (gameStatus) => {
    clearWuxieResStage(gameStatus);
    gameStatus.shanResponse = undefined;
    gameStatus.skillResponse = undefined;
    gameStatus.taoResStages = [];
    gameStatus.scrollResStages = [];
    gameStatus.weaponResStages = [];
}

exports.clearNextTaoStage = clearNextTaoStage;
exports.clearShanResponse = clearShanResponse;
exports.clearSkillResponse = clearSkillResponse;
exports.clearNextScrollStage = clearNextScrollStage;
exports.clearNextWeaponStage = clearNextWeaponStage;
exports.clearWuxieResStage = clearWuxieResStage;
exports.clearAllResStages = clearAllResStages;