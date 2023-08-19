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
    WEI004: {
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

    // WU
    WU006: {
        maxBlood: 3,
        gender: 0
    },
}

// 武将技能切换和失效的时候 删除
const HERO_SKILL_PROPS_CONFIG = {
    SHU003: {
        shaLimitTimes: 100,
    }
}

const HERO_SKILLS_CONFIG = {
    WEI001: [SKILL_CONFIG.WEI001_JIAN_XIONG, SKILL_CONFIG.WEI001_HU_JIA],
    WEI002: [SKILL_CONFIG.WEI002_FAN_KUI, SKILL_CONFIG.WEI002_GUI_CAI],
    WEI004: [SKILL_CONFIG.WEI004_TU_XI],
    SHU003: [SKILL_CONFIG.SHU003_PAO_XIAO],
    SHU006: [SKILL_CONFIG.SHU006_MA_SHU, SKILL_CONFIG.SHU006_TIE_JI],
    WU006: [SKILL_CONFIG.WU006_GUO_SE, SKILL_CONFIG.WU006_LIU_LI],
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
        ...HERO_SKILL_PROPS_CONFIG[heroId],
        kingdom: extractEnglishLetters(heroId) || "QUN",
        skills: HERO_SKILLS_CONFIG[heroId] || [],
    }
}

exports.getHeroConfig = getHeroConfig;