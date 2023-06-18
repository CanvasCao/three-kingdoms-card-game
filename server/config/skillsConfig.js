const {PANDING_EVENT_TIMING} = require("./eventConfig");
const {CARD_CONFIG} = require("./cardConfig");
const {USE_EVENT_TIMING} = require("./eventConfig");

const realSkills = {
    WEI002: [],
    SHU006: [
        {name: '马术'},
        {
            name: '铁骑',
            triggerTiming: USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET,
            triggerCard: CARD_CONFIG.SHA.CN,
        }
    ],
    WU006: [
        {name: '国色'},
        {
            name: '流离',
            triggerTiming: USE_EVENT_TIMING.WHEN_BECOMING_TARGET,
            triggerCard: CARD_CONFIG.SHA.CN,
        }
    ],
}
const fakeSkills = {
    SHU001: [
        // {
        //     name: '流离',
        //     triggerTiming: USE_EVENT_TIMING.WHEN_BECOMING_TARGET,
        //     triggerCard: CARD_CONFIG.SHA.CN,
        // },
        {
            name: '铁骑',
            triggerTiming: USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET,
            triggerCard: CARD_CONFIG.SHA.CN,
        },
        // {
        //     name: '鬼才',
        //     triggerTiming: PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT,
        // }
    ]
}

const SKILLS = fakeSkills;
// const SKILLS = realSkills;
exports.SKILLS = SKILLS;