const {DAMAGE_EVENT_TIMING} = require("./eventConfig");
const {PANDING_EVENT_TIMING} = require("./eventConfig");
const {CARD_CONFIG} = require("./cardConfig");
const {USE_EVENT_TIMING} = require("./eventConfig");

const SKILL_NAMES = {
    "WEI001": {
        JIAN_XIONG: {
            CN: '奸雄',
            EN: 'JIAN XIONG'
        },
        HU_JIA: {
            CN: '护驾',
            EN: 'HU JIA'
        }
    },
    "WEI002": {
        FAN_KUI: {
            CN: '反馈',
            EN: 'FAN KUI'
        },
        GUI_CAI: {
            CN: '鬼才',
            EN: 'GUI CAI'
        }
    },

    "SHU006": {
        MA_SHU: {
            CN: '马术',
            EN: 'MA SHU'
        },
        TIE_JI: {
            CN: '铁骑',
            EN: 'TIE JI'
        },
    },


    "WU006": {
        GUO_SE: {
            CN: '国色',
            EN: 'GUO SE'
        },
        LIU_LI: {
            CN: '流离',
            EN: 'LIU LI'
        },
    },

}

const realTimingSkills = {
    WEI002: [
        {
            name: SKILL_NAMES.WEI002.FAN_KUI.CN,
            triggerTiming: DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE,
            needOrigin: true,
            needOriginHasCards: true,
        },
        {
            name: SKILL_NAMES.WEI002.GUI_CAI.CN,
            triggerTiming: PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT,
        }
    ],
    SHU006: [
        {
            name: SKILL_NAMES.SHU006.TIE_JI.CN,
            triggerTiming: USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET,
            triggerCardName: CARD_CONFIG.SHA.CN,
        }
    ],
    WU006: [
        {
            name: SKILL_NAMES.WU006.LIU_LI.CN,
            triggerTiming: USE_EVENT_TIMING.WHEN_BECOMING_TARGET,
            triggerCardName: CARD_CONFIG.SHA.CN,
        }
    ],
}

const TIMING_SKILLS = realTimingSkills;
exports.TIMING_SKILLS = TIMING_SKILLS;
exports.SKILL_NAMES = SKILL_NAMES;