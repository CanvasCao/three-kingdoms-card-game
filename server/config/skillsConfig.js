const {BASIC_CARDS_CONFIG} = require("./cardConfig");
const {intersectionBy} = require("lodash/array");
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
    WEI006_YI_JI: {
        key: 'WEI006_YI_JI',
    },
    WEI006_TIAN_DU: {
        key: 'WEI006_TIAN_DU',
    },
    WEI007_QING_GUO: {
        key: 'WEI007_QING_GUO',
    },
    WEI007_LUO_SHEN: {
        key: 'WEI007_LUO_SHEN',
    },

    SHU001_REN_DE: {
        key: 'SHU001_REN_DE',
    },
    SHU002_WU_SHENG: {
        key: 'SHU002_WU_SHENG',
    },
    SHU003_PAO_XIAO: {
        key: 'SHU003_PAO_XIAO',
    },
    SHU004_GUAN_XING: {
        key: 'SHU004_GUAN_XING',
    },
    SHU004_KONG_CHENG: {
        key: 'SHU004_KONG_CHENG',
    },
    SHU005_LONG_DAN: {
        key: 'SHU005_LONG_DAN',
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

    WU001_ZHI_HENG: {
        key: 'WU001_ZHI_HENG',
    },
    WU002_QI_XI: {
        key: 'WU002_QI_XI',
    },
    WU003_KE_JI: {
        key: 'WU003_KE_JI',
    },
    WU004_KU_ROU: {
        key: 'WU004_KU_ROU',
    },
    WU005_YING_ZI: {
        key: 'WU005_YING_ZI',
    },
    WU005_FAN_JIAN: {
        key: 'WU005_FAN_JIAN',
    },
    WU006_GUO_SE: {
        key: 'WU006_GUO_SE',
    },
    WU006_LIU_LI: {
        key: 'WU006_LIU_LI',
    },
    WU007_QIAN_XUN: {
        key: 'WU007_QIAN_XUN',
    },
    WU007_LIAN_YING: {
        key: 'WU007_LIAN_YING',
    },
    WU008_XIAO_JI: {
        key: 'WU008_XIAO_JI',
    },
    WU008_JIE_YIN: {
        key: 'WU008_JIE_YIN',
    },


    QUN001_QING_NANG: {
        key: 'QUN001_QING_NANG',
    },
    QUN001_JI_JIU: {
        key: 'QUN001_JI_JIU',
    },
    QUN002_WU_SHUANG: {
        key: 'QUN002_WU_SHUANG',
    },
    QUN003_LI_JIAN: {
        key: 'QUN003_LI_JIAN',
    },
    QUN003_BI_YUE: {
        key: 'QUN003_BI_YUE',
    },

    SP001_CHONG_SHENG: {
        key: 'SP001_CHONG_SHENG',
    }
}

const TIMING_SKILLS_CONFIG = {
    WEI001_JIAN_XIONG: {
        key: "WEI001_JIAN_XIONG",
        triggerTiming: DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE,
        validate: (gameStatus, {onGoingDamageEvent}) => {
            return !!intersectionBy(onGoingDamageEvent?.damageCards, gameStatus.throwedCards, 'cardId').length
        }
    },
    WEI002_FAN_KUI: {
        key: "WEI002_FAN_KUI",
        triggerTiming: DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE,
        validate: (gameStatus, {originPlayer}) => {
            return originPlayer && originPlayer.hasAnyCards()
        }
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
    WEI006_YI_JI: {
        key: "WEI006_YI_JI",
        triggerTiming: DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE,
        triggerByDamageNumber: true,
    },
    WEI007_LUO_SHEN: {
        key: "WEI007_LUO_SHEN",
        triggerTiming: GAME_STAGE_TIMING.GAME_STAGE_WHEN_PREPARE,
    },

    SHU004_GUAN_XING: {
        key: "SHU004_GUAN_XING",
        triggerTiming: GAME_STAGE_TIMING.GAME_STAGE_WHEN_PREPARE,
    },
    SHU006_TIE_JI: {
        key: "SHU006_TIE_JI",
        triggerTiming: USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET,
    },
    WU003_KE_JI: {
        key: "WU003_KE_JI",
        triggerTiming: GAME_STAGE_TIMING.GAME_STAGE_BETWEEN_PLAY_AND_THROW,
        validate: (gameStatus, {originId}) => {
            const {log, stage, players} = gameStatus
            if (players[originId].needThrow()) {
                const hasUsedOrPlayedSha = log.hasUsedOrPlayed({
                    roundNumber: stage.getRoundNumber(),
                    whoseRoundId: originId,
                    playerId: originId,
                    cardKey: BASIC_CARDS_CONFIG.SHA.key,
                })
                return !hasUsedOrPlayedSha;
            }
            return false
        }
    },
    WU006_LIU_LI: {
        key: "WU006_LIU_LI",
        triggerTiming: USE_EVENT_TIMING.WHEN_BECOMING_TARGET,
    },
}

exports.TIMING_SKILLS_CONFIG = TIMING_SKILLS_CONFIG;
exports.SKILL_CONFIG = SKILL_CONFIG;