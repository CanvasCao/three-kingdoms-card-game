const {PANDING_EVENT_TIMING} = require("./eventConfig");
const {CARD_CONFIG} = require("./cardConfig");
const {USE_EVENT_TIMING} = require("./eventConfig");

const SKILL_NAMES = {
    WEI: {
        "001": {
            JIAN_XIONG: '奸雄',
            HU_JIA: '护驾',
        },
        "002": {
            FAN_KUI: '反馈',
            GUI_CAI: '鬼才',
        },
    },
    SHU: {
        "006": {
            MA_SHU: '马术',
            TIE_JI: '铁骑',
        },
    },
    WU: {
        "006": {
            GUO_SE: '国色',
            LIU_LI: '流离',
        },
    }
}

const realSkills = {
    WEI002: [],
    SHU006: [
        {name: SKILL_NAMES.SHU["006"].MA_SHU},
        {
            name: SKILL_NAMES.SHU["006"].TIE_JI,
            triggerTiming: USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET,
            triggerCardName: CARD_CONFIG.SHA.CN,
        }
    ],
    WU006: [
        {name: SKILL_NAMES.WU["006"].GUO_SE},
        {
            name: SKILL_NAMES.WU["006"].LIU_LI,
            triggerTiming: USE_EVENT_TIMING.WHEN_BECOMING_TARGET,
        }
    ],
}
const fakeSkills = {
    SHU001: [
        // {
        //     name: SKILL_NAMES.WU["006"].LIU_LI,
        //     triggerTiming: USE_EVENT_TIMING.WHEN_BECOMING_TARGET,
        //     triggerCardName: CARD_CONFIG.SHA.CN,
        // },
        // {
        //     name: SKILL_NAMES.SHU["006"].TIE_JI,
        //     triggerTiming: USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET,
        //     triggerCardName: CARD_CONFIG.SHA.CN,
        // },
        // {
        //     name: SKILL_NAMES.WEI["002"].GUI_CAI,
        //     triggerTiming: PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT,
        // }
    ]
}

const SKILLS = fakeSkills;
// const SKILLS = realSkills;
exports.SKILLS = SKILLS;
exports.SKILL_NAMES = SKILL_NAMES;