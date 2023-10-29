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

const clearFanJianBoardResponse = (gameStatus) => {
    gameStatus.fanJianBoardResponse = undefined;
}

const clearGuanXingBoardResponse = (gameStatus) => {
    gameStatus.guanXingBoardResponse = undefined;
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
    gameStatus.fanJianBoardResponse = undefined;
    gameStatus.guanXingBoardResponse = undefined;
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
    } else if (gameStatus.fanJianBoardResponse) {
        return RESPONSE_TYPE_CONFIG.FAN_JIAN_BOARD;
    }  else if (gameStatus.guanXingBoardResponse) {
        return RESPONSE_TYPE_CONFIG.FAN_JIAN_BOARD;
    } else if (gameStatus.wuxieSimultaneousResponse?.hasWuxiePlayerIds?.length > 0) {
        return RESPONSE_TYPE_CONFIG.WUXIE;
    }
}

const ifAnyPlayerNeedToResponse = (gameStatus) => {
    if (gameStatus.cardResponse ||
        gameStatus.skillResponse ||
        gameStatus.taoResponses.length > 0 ||
        gameStatus.cardBoardResponses.length > 0 ||
        gameStatus.fanJianBoardResponse ||
        gameStatus.guanXingBoardResponse ||
        gameStatus.wuxieSimultaneousResponse.hasWuxiePlayerIds.length > 0
    ) {
        return true
    }
    return false
}

exports.clearNextTaoResponse = clearNextTaoResponse;
exports.clearNextCardBoardResponse = clearNextCardBoardResponse;
exports.clearFanJianBoardResponse = clearFanJianBoardResponse;
exports.clearGuanXingBoardResponse = clearGuanXingBoardResponse;
exports.clearCardResponse = clearCardResponse;
exports.clearSkillResponse = clearSkillResponse;
exports.clearWuxieSimultaneousResponse = clearWuxieSimultaneousResponse;
exports.clearAllResponses = clearAllResponses;

exports.getResponseType = getResponseType;
exports.ifAnyPlayerNeedToResponse = ifAnyPlayerNeedToResponse;