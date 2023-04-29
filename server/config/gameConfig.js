const GAME_STATUS = {
    "PLAYING": "PLAYING",
    "IDLE": "IDLE" // 默认值 未开始的游戏gamestatus为null idle只存在很短暂的时间
}

const GAME_STAGE = {
    "START": "START",
    "JUDGE": "JUDGE",
    "DRAW": "DRAW",
    "PLAY": "PLAY",
    "THROW": "THROW",
    "END": "END",
}

const STAGE_NAMES = [
    GAME_STAGE.START,
    GAME_STAGE.JUDGE,
    GAME_STAGE.DRAW,
    GAME_STAGE.PLAY,
    GAME_STAGE.THROW,
    GAME_STAGE.END
]

exports.GAME_STATUS = GAME_STATUS;
exports.GAME_STAGE = GAME_STAGE;
exports.STAGE_NAMES = STAGE_NAMES;
