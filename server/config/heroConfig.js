const {BASIC_CARDS_CONFIG} = require("./cardConfig");
const {SCROLL_CARDS_CONFIG} = require("./cardConfig");
const {SKILL_CONFIG} = require("./skillsConfig");
const {ACTION} = require("../action/action");

const HERO_STATIC_CONFIG = {
    WEI001: {
        maxBlood: 4,
        gender: 1
    },
    WEI002: {
        maxBlood: 3,
        gender: 1
    },
    WEI003: {
        maxBlood: 4,
        gender: 1
    },
    WEI004: {
        maxBlood: 4,
        gender: 1
    },
    WEI005: {
        maxBlood: 4,
        gender: 1
    },
    WEI006: {
        maxBlood: 3,
        gender: 1
    },
    WEI007: {
        maxBlood: 3,
        gender: 0
    },

    // SHU
    SHU001: {
        maxBlood: 4,
        gender: 1
    },
    SHU002: {
        maxBlood: 4,
        gender: 1
    },
    SHU003: {
        maxBlood: 4,
        gender: 1
    },
    SHU004: {
        maxBlood: 3,
        gender: 1
    },
    SHU005: {
        maxBlood: 4,
        gender: 1
    },
    SHU006: {
        maxBlood: 4,
        gender: 1
    },
    SHU007: {
        maxBlood: 3,
        gender: 0
    },

    // WU
    WU001: {
        maxBlood: 4,
        gender: 1
    },
    WU002: {
        maxBlood: 4,
        gender: 1
    },
    WU003: {
        maxBlood: 4,
        gender: 1
    },
    WU004: {
        maxBlood: 4,
        gender: 1
    },
    WU005: {
        maxBlood: 3,
        gender: 1
    },
    WU006: {
        maxBlood: 3,
        gender: 0
    },
    WU007: {
        maxBlood: 3,
        gender: 1
    },
    WU008: {
        maxBlood: 3,
        gender: 0
    },

    // QUN
    QUN001: {
        maxBlood: 3,
        gender: 1
    },
    QUN002: {
        maxBlood: 4,
        gender: 1
    },
    QUN003: {
        maxBlood: 3,
        gender: 0
    },

    // SP
    // SP001: {
    //     maxBlood: 3,
    //     gender: 0
    // },
}

// 武将技能切换和失效的时候 删除
const HERO_SKILL_DYNAMIC_CONFIG = {
    SHU003_PAO_XIAO: {
        shaLimitTimes: 100,
    },
    SHU004_KONG_CHENG: {
        cantBeTargetWhenNoHandCardsKeys: [
            BASIC_CARDS_CONFIG.HUO_SHA.key,
            BASIC_CARDS_CONFIG.LEI_SHA.key,
            BASIC_CARDS_CONFIG.SHA.key,
            SCROLL_CARDS_CONFIG.JUE_DOU.key]
    },
    SHU006_MA_SHU: {
        minusHorseDistance: -1,
    },
    SHU007_JI_ZHI: {
        drawCardsNumberWhenPlayImmediateScroll: 1,
    },
    SHU007_QI_CAI: {
        bingLiangRange: 100,
        shunRange: 100,
    },

    WU005_YING_ZI: {
        drawCardNumber: 3,
    },
    WU007_QIAN_XUN: {
        cantBeTargetKeys: [SCROLL_CARDS_CONFIG.SHUN_SHOU_QIAN_YANG.key, SCROLL_CARDS_CONFIG.LE_BU_SI_SHU.key]
    },
    WU007_LIAN_YING: {
        cardsRemoved: (player, gameStatus) => {
            if (player.cards.length == 0) {
                ACTION.draw(gameStatus, player, 1)
            }
        }
    },
    WU008_XIAO_JI: {
        cardsWillRemove: (player, cards, gameStatus) => {
            const {weaponCard, shieldCard, plusHorseCard, minusHorseCard} = player
            const removeCards = Array.isArray(cards) ? cards : [cards]
            removeCards.forEach(card => {
                if ([weaponCard?.cardId,
                    shieldCard?.cardId,
                    plusHorseCard?.cardId,
                    minusHorseCard?.cardId].includes(card.cardId)) {
                    ACTION.draw(gameStatus, player)
                }
            })
        }
    },

    QUN002_WU_SHUANG: {
        responseStrikeNumber: 2,
        responseDuelNumber: 2,
    },
    QUN003_BI_YUE: {
        gameStageWhenEndStart: (player, gameStatus) => {
            ACTION.draw(gameStatus, player, 1)
        }
    },

    SP001_CHONG_SHENG: {
        canRebirth: true,
    }
}

const HERO_SKILLS_CONFIG = {
    WEI001: [SKILL_CONFIG.WEI001_JIAN_XIONG],
    WEI002: [SKILL_CONFIG.WEI002_FAN_KUI, SKILL_CONFIG.WEI002_GUI_CAI],
    WEI003: [SKILL_CONFIG.WEI003_GANG_LIE],
    WEI004: [SKILL_CONFIG.WEI004_TU_XI],
    WEI005: [SKILL_CONFIG.WEI005_LUO_YI],
    WEI006: [SKILL_CONFIG.WEI006_YI_JI, SKILL_CONFIG.WEI006_TIAN_DU],
    WEI007: [SKILL_CONFIG.WEI007_QING_GUO, SKILL_CONFIG.WEI007_LUO_SHEN],

    SHU001: [SKILL_CONFIG.SHU001_REN_DE],
    SHU002: [SKILL_CONFIG.SHU002_WU_SHENG],
    SHU003: [SKILL_CONFIG.SHU003_PAO_XIAO],
    SHU004: [SKILL_CONFIG.SHU004_GUAN_XING, SKILL_CONFIG.SHU004_KONG_CHENG],
    SHU005: [SKILL_CONFIG.SHU005_LONG_DAN],
    SHU006: [SKILL_CONFIG.SHU006_MA_SHU, SKILL_CONFIG.SHU006_TIE_JI],
    SHU007: [SKILL_CONFIG.SHU007_JI_ZHI, SKILL_CONFIG.SHU007_QI_CAI],

    WU001: [SKILL_CONFIG.WU001_ZHI_HENG],
    WU002: [SKILL_CONFIG.WU002_QI_XI],
    WU003: [SKILL_CONFIG.WU003_KE_JI],
    WU004: [SKILL_CONFIG.WU004_KU_ROU],
    WU005: [SKILL_CONFIG.WU005_YING_ZI, SKILL_CONFIG.WU005_FAN_JIAN],
    WU006: [SKILL_CONFIG.WU006_GUO_SE, SKILL_CONFIG.WU006_LIU_LI],
    WU007: [SKILL_CONFIG.WU007_QIAN_XUN, SKILL_CONFIG.WU007_LIAN_YING],
    WU008: [SKILL_CONFIG.WU008_XIAO_JI, SKILL_CONFIG.WU008_JIE_YIN],

    QUN001: [SKILL_CONFIG.QUN001_QING_NANG, SKILL_CONFIG.QUN001_JI_JIU],
    QUN002: [SKILL_CONFIG.QUN002_WU_SHUANG],
    QUN003: [SKILL_CONFIG.QUN003_LI_JIAN, SKILL_CONFIG.QUN003_BI_YUE],
    SP001: [SKILL_CONFIG.SP001_CHONG_SHENG],
}

const extractEnglishLetters = (inputString) => {
    let result = '';
    for (let i = 0; i < inputString.length; i++) {
        const char = inputString.charAt(i);
        if (/[a-zA-Z]/.test(char)) {
            result += char;
        } else {
            break;
        }
    }
    return result;
}

const getHeroConfig = (heroId) => {
    const skills = HERO_SKILLS_CONFIG[heroId] || []
    let dynamicConfig = {};
    skills.forEach(skill => {
        const skillDynamicConfig = HERO_SKILL_DYNAMIC_CONFIG[skill.key]
        dynamicConfig = {
            ...dynamicConfig,
            ...skillDynamicConfig,
        }
    })

    return {
        heroId,
        ...HERO_STATIC_CONFIG[heroId],
        ...dynamicConfig,
        kingdom: extractEnglishLetters(heroId),
        skills,
    }
}

exports.HERO_STATIC_CONFIG = HERO_STATIC_CONFIG;
exports.getHeroConfig = getHeroConfig;