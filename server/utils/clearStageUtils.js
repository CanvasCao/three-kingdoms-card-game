const clearNextTaoStage = (gameStatus) => {
    gameStatus.taoResStages.shift();
}

const clearNextShanStage = (gameStatus) => {
    gameStatus.shanResStages.shift();
}

const clearNextScrollStage = (gameStatus) => {
    gameStatus.scrollResStages.shift();
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
exports.clearWuxieResStage = clearWuxieResStage;