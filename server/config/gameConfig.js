const GAME_STATUS = {
    "PLAYING": "PLAYING",
    "IDLE": "IDLE" // 默认值 未开始的游戏gamestatus为null idle只存在很短暂的时间
}

const GAME_STAGE = {
    "START": "start",
    "JUDGE": "judge",
    "DRAW": "draw",
    "PLAY": "play",
    "THROW": "throw",
    "END": "end",
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
exports.GAME_STAGE = GAME_STAGE;
exports.STAGE_NAMES = STAGE_NAMES;
