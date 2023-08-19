const GAME_STATUS = {
    "PLAYING": "PLAYING",
    "IDLE": "IDLE" // 默认值 未开始的游戏gamestatus为null idle只存在很短暂的时间
}

const STAGE_NAME = {
    "START": "START",
    "JUDGE": "JUDGE",
    "DRAW": "DRAW",
    "PLAY": "PLAY",
    "THROW": "THROW",
    "END": "END",
}

const STAGE_NAMES = [
    STAGE_NAME.START,
    STAGE_NAME.JUDGE,
    STAGE_NAME.DRAW,
    STAGE_NAME.PLAY,
    STAGE_NAME.THROW,
    STAGE_NAME.END
]

exports.GAME_STATUS = GAME_STATUS;
exports.STAGE_NAME = STAGE_NAME;
exports.STAGE_NAMES = STAGE_NAMES;
