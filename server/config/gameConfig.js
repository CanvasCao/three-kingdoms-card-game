const GAME_STATUS = {
    "PLAYING": "PLAYING",
    "IDLE": "IDLE" // 默认值 未开始的游戏gamestatus为null idle只存在很短暂的时间
}

const STAGE_NAMES = [
    "start",
    "judge",
    "draw",
    "play",
    "throw",
    "end"
]

exports.GAME_STATUS = GAME_STATUS;
exports.STAGE_NAMES = STAGE_NAMES;
