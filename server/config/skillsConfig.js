const {DAMAGE_EVENT_TIMING} = require("./eventConfig");
const {PANDING_EVENT_TIMING} = require("./eventConfig");
const {CARD_CONFIG} = require("./cardConfig");
const {USE_EVENT_TIMING} = require("./eventConfig");

const SKILL_NAMES = {
    "WEI001": {
        JIAN_XIONG: {
            key: 'JIAN_XIONG',
        },
        HU_JIA: {
            key: 'HU_JIA',
        }
    },
    "WEI002": {
        FAN_KUI: {
            key: 'FAN_KUI',
        },
        GUI_CAI: {
            key: 'GUI_CAI',
        }
    },

    "SHU003": {
        PAO_XIAO: {
            key: 'PAO_XIAO',
        },
    },
    "SHU006": {
        MA_SHU: {
            key: 'MA_SHU',
        },
        TIE_JI: {
            key: 'TIE_JI',
        },
    },


    "WU006": {
        GUO_SE: {
            key: 'GUO_SE',
        },
        LIU_LI: {
            key: 'LIU_LI',
        },
    },

}
const realTimingSkills = {
    WEI002: [
        {
            nameKey: SKILL_NAMES.WEI002.FAN_KUI.key,
            triggerTiming: DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE,
            needOrigin: true,
            needOriginHasCards: true,
        },
        {
            nameKey: SKILL_NAMES.WEI002.GUI_CAI.key,
            triggerTiming: PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT,
        }
    ],
    SHU006: [
        {
            nameKey: SKILL_NAMES.SHU006.TIE_JI.key,
            triggerTiming: USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET,
            triggerCardName: CARD_CONFIG.SHA.key,
        }
    ],
    WU006: [
        {
            nameKey: SKILL_NAMES.WU006.LIU_LI.key,
            triggerTiming: USE_EVENT_TIMING.WHEN_BECOMING_TARGET,
            triggerCardName: CARD_CONFIG.SHA.key,
        }
    ],
}

const TIMING_SKILLS = realTimingSkills;
exports.TIMING_SKILLS = TIMING_SKILLS;
exports.SKILL_NAMES = SKILL_NAMES;