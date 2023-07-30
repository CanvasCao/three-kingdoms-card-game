const {RESPONSE_TYPE_CONFIG} = require("../config/responseTypeConfig");

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
}

const getResponseType = (gameStatus) => {
    if (gameStatus.taoResponses.length > 0) {
        return RESPONSE_TYPE_CONFIG.TAO;
    } else if (gameStatus.shanResponse) {
        return RESPONSE_TYPE_CONFIG.SHAN;
    } else if (gameStatus.skillResponse) {
        return RESPONSE_TYPE_CONFIG.SKILL;
    } else if (gameStatus.wuxieSimultaneousResponse?.hasWuxiePlayerIds?.length > 0) {
        return RESPONSE_TYPE_CONFIG.WUXIE;
    } else if (gameStatus.scrollResponses.length > 0) {
        return RESPONSE_TYPE_CONFIG.SCROLL;
    }
}

exports.clearNextTaoResponse = clearNextTaoResponse;
exports.clearShanResponse = clearShanResponse;
exports.clearSkillResponse = clearSkillResponse;
exports.clearNextScrollResponse = clearNextScrollResponse;
exports.clearWuxieSimultaneousResponse = clearWuxieSimultaneousResponse;
exports.clearAllResponses = clearAllResponses;
exports.getResponseType = getResponseType;