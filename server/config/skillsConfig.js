const {DAMAGE_EVENT_TIMING} = require("./eventConfig");
const {PANDING_EVENT_TIMING} = require("./eventConfig");
const {CARD_CONFIG} = require("./cardConfig");
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

    SHU003_PAO_XIAO: {
        key: 'SHU003_PAO_XIAO',
    },
    SHU006_MA_SHU: {
        key: 'SHU006_MA_SHU',
    },
    SHU006_TIE_JI: {
        key: 'SHU006_TIE_JI',
    },

    WU006_GUO_SE: {
        key: 'WU006_GUO_SE',
    },
    WU006_LIU_LI: {
        key: 'WU006_LIU_LI',
    },
}

const TIMING_SKILLS_CONFIG = {
    WEI002_FAN_KUI: {
        key:"WEI002_FAN_KUI",
        triggerTiming: DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE,
        needOrigin: true,
        needOriginHasCards: true,
    },
    WEI002_GUI_CAI: {
        key:"WEI002_GUI_CAI",
        triggerTiming: PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT,
    },
    SHU006_TIE_JI: {
        key:"SHU006_TIE_JI",
        triggerTiming: USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET,
        triggerCardName: CARD_CONFIG.SHA.key,
    },
    WU006_LIU_LI: {
        key:"WU006_LIU_LI",
        triggerTiming: USE_EVENT_TIMING.WHEN_BECOMING_TARGET,
        triggerCardName: CARD_CONFIG.SHA.key,
    },
}

exports.TIMING_SKILLS_CONFIG = TIMING_SKILLS_CONFIG;
exports.SKILL_CONFIG = SKILL_CONFIG;