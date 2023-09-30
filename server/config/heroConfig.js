const {SKILL_CONFIG} = require("./skillsConfig");

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

    // SHU
    SHU003: {
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
    WU006: {
        maxBlood: 3,
        gender: 0
    },

    // QUN
    QUN002: {
        maxBlood: 4,
        gender: 1
    },

    // SP
    SP001: {
        maxBlood: 3,
        gender: 0
    },
}

// 武将技能切换和失效的时候 删除
const HERO_SKILL_DYNAMIC_CONFIG = {
    SHU003: {
        shaLimitTimes: 100,
    },
    SHU007: {
        drawCardsNumberWhenPlayImmediateScroll: 1,
        bingLiangRange: 100,
        shunRange: 100,
    },
    QUN002: {
        responseStrikeNumber: 2,
        responseDuelNumber: 2,
    },
    SP001: {
        canRebirth: true,
    }
}

const HERO_SKILLS_CONFIG = {
    WEI001: [SKILL_CONFIG.WEI001_JIAN_XIONG],
    WEI002: [SKILL_CONFIG.WEI002_FAN_KUI, SKILL_CONFIG.WEI002_GUI_CAI],
    WEI003: [SKILL_CONFIG.WEI003_GANG_LIE],
    WEI004: [SKILL_CONFIG.WEI004_TU_XI],
    WEI005: [SKILL_CONFIG.WEI005_LUO_YI],
    SHU003: [SKILL_CONFIG.SHU003_PAO_XIAO],
    SHU006: [SKILL_CONFIG.SHU006_MA_SHU, SKILL_CONFIG.SHU006_TIE_JI],
    SHU007: [SKILL_CONFIG.SHU007_JI_ZHI, SKILL_CONFIG.SHU007_QI_CAI],
    WU006: [SKILL_CONFIG.WU006_GUO_SE, SKILL_CONFIG.WU006_LIU_LI],
    QUN002: [SKILL_CONFIG.QUN002_WU_SHUANG],
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
    return {
        heroId,
        ...HERO_STATIC_CONFIG[heroId],
        ...HERO_SKILL_DYNAMIC_CONFIG[heroId],
        kingdom: extractEnglishLetters(heroId),
        skills: HERO_SKILLS_CONFIG[heroId] || [],
    }
}

exports.getHeroConfig = getHeroConfig;