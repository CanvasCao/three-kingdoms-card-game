const {SKILL_NAMES} = require("./skillsConfig");

const HERO_STATIC_CONFIG = {
    WEI001: {
        maxBlood: 4,
        gender: 1
    },
    WEI002: {
        maxBlood: 3,
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
    const skills = Object.keys(SKILL_NAMES[heroId]).map(key => SKILL_NAMES[heroId][key]);
    const kingdom = extractEnglishLetters(heroId) || "QUN"

    return {
        ...HERO_STATIC_CONFIG[heroId],
        ...HERO_SKILL_PROPS_CONFIG[heroId],
        kingdom,
        skills,
    }
}

exports.getHeroConfig = getHeroConfig;