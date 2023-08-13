const {RESPONSE_TYPE_CONFIG} = require("../config/responseTypeConfig");

const clearCardResponse = (gameStatus) => {
    gameStatus.cardResponse = undefined;
}

const clearSkillResponse = (gameStatus) => {
    gameStatus.skillResponse = undefined;
}

const clearNextTaoResponse = (gameStatus) => {
    gameStatus.taoResponses.shift();
}

const clearNextCardBoardResponse = (gameStatus) => {
    gameStatus.cardBoardResponses.shift();
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
    gameStatus.cardResponse = undefined;
    gameStatus.skillResponse = undefined;
    gameStatus.taoResponses = [];
    gameStatus.cardBoardResponses = [];
    gameStatus.scrollResponses = [];
}

const getResponseType = (gameStatus) => {
    if (gameStatus.taoResponses.length > 0) {
        return RESPONSE_TYPE_CONFIG.TAO;
    } else if (gameStatus.cardResponse) {
        return RESPONSE_TYPE_CONFIG.CARD;
    } else if (gameStatus.skillResponse) {
        return RESPONSE_TYPE_CONFIG.SKILL;
    } else if (gameStatus.cardBoardResponses.length > 0) {
        return RESPONSE_TYPE_CONFIG.CARD_BOARD;
    } else if (gameStatus.wuxieSimultaneousResponse?.hasWuxiePlayerIds?.length > 0) {
        return RESPONSE_TYPE_CONFIG.WUXIE;
    } else if (gameStatus.scrollResponses.length > 0) {
        return RESPONSE_TYPE_CONFIG.SCROLL;
    }
}

exports.clearNextTaoResponse = clearNextTaoResponse;
exports.clearNextCardBoardResponse = clearNextCardBoardResponse;
exports.clearCardResponse = clearCardResponse;
exports.clearSkillResponse = clearSkillResponse;
exports.clearNextScrollResponse = clearNextScrollResponse;
exports.clearWuxieSimultaneousResponse = clearWuxieSimultaneousResponse;
exports.clearAllResponses = clearAllResponses;
exports.getResponseType = getResponseType;