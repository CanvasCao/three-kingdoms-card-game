const clearNextTaoStage = (gameStatus) => {
    gameStatus.taoResStages.shift();
}

const clearNextShanStage = (gameStatus) => {
    gameStatus.shanResStages.shift();
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

exports.clearNextTaoStage = clearNextTaoStage;
exports.clearNextShanStage = clearNextShanStage;
exports.clearNextScrollStage = clearNextScrollStage;
exports.clearNextWeaponStage = clearNextWeaponStage;
exports.clearWuxieResStage = clearWuxieResStage;