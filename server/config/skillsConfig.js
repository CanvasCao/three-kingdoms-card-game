const {GAME_STAGE_TIMING} = require("./eventConfig");
const {DAMAGE_EVENT_TIMING} = require("./eventConfig");
const {PANDING_EVENT_TIMING} = require("./eventConfig");
const {USE_EVENT_TIMING} = require("./eventConfig");

const SKILL_CONFIG = {
    WEI001_JIAN_XIONG: {
        key: 'WEI001_JIAN_XIONG',
    },
    WEI001_HU_JIA: {
        key: 'WEI001_HU_JIA',
    },
    WEI002_FAN_KUI: {
        key: 'WEI002_FAN_KUI',
    },
    WEI002_GUI_CAI: {
        key: 'WEI002_GUI_CAI',
    },
    WEI003_GANG_LIE: {
        key: 'WEI003_GANG_LIE',
    },
    WEI004_TU_XI: {
        key: 'WEI004_TU_XI',
    },
    WEI005_LUO_YI: {
        key: 'WEI005_LUO_YI',
    },

    SHU003_PAO_XIAO: {
        key: 'SHU003_PAO_XIAO',
    },
    SHU006_MA_SHU: {
        key: 'SHU006_MA_SHU',
    },
    SHU006_TIE_JI: {
        key: 'SHU006_TIE_JI',
    },
    SHU007_JI_ZHI: {
        key: 'SHU007_JI_ZHI',
    },
    SHU007_QI_CAI: {
        key: 'SHU007_QI_CAI',
    },

    WU006_GUO_SE: {
        key: 'WU006_GUO_SE',
    },
    WU006_LIU_LI: {
        key: 'WU006_LIU_LI',
    },

    QUN002_WU_SHUANG: {
        key: 'QUN002_WU_SHUANG',
    },

    SP001_CHONG_SHENG: {
        key: 'SP001_CHONG_SHENG',
    }
}

const TIMING_SKILLS_CONFIG = {
    WEI001_JIAN_XIONG: {
        key: "WEI001_JIAN_XIONG",
        triggerTiming: DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE,
        needDamageCards: true
    },
    WEI002_FAN_KUI: {
        key: "WEI002_FAN_KUI",
        triggerTiming: DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE,
        needOrigin: true,
        needOriginHasCards: true,
    },
    WEI002_GUI_CAI: {
        key: "WEI002_GUI_CAI",
        triggerTiming: PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT,
    },
    WEI003_GANG_LIE: {
        key: "WEI003_GANG_LIE",
        triggerTiming: DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE,
    },
    WEI004_TU_XI: {
        key: "WEI004_TU_XI",
        triggerTiming: GAME_STAGE_TIMING.GAME_STAGE_WHEN_DRAW_START,
    },
    WEI005_LUO_YI: {
        key: "WEI005_LUO_YI",
        triggerTiming: GAME_STAGE_TIMING.GAME_STAGE_IS_DRAWING,
    },

    SHU006_TIE_JI: {
        key: "SHU006_TIE_JI",
        triggerTiming: USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET,
    },
    WU006_LIU_LI: {
        key: "WU006_LIU_LI",
        triggerTiming: USE_EVENT_TIMING.WHEN_BECOMING_TARGET,
    },
}

exports.TIMING_SKILLS_CONFIG = TIMING_SKILLS_CONFIG;
exports.SKILL_CONFIG = SKILL_CONFIG;