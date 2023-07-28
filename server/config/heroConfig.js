const {SKILL_NAMES} = require("./skillsConfig");

const HERO_CONFIG = {
    WEI001: {
        maxBlood: 4,
        heroName: "曹操",
        gender: 1
    },
    WEI002: {
        maxBlood: 3,
        heroName: "司马懿",
        gender: 1
    },

    // SHU
    SHU003: {
        maxBlood: 4,
        shaLimitTimes: 100,
        heroName: "张飞",
        gender: 1
    },
    SHU006: {
        maxBlood: 4,
        heroName: "马超",
        gender: 1
    },

    // WU
    WU006: {
        maxBlood: 3,
        heroName: "大乔",
        gender: 0
    },
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
        ...HERO_CONFIG[heroId],
        kingdom,
        skills,
    }
}

exports.getHeroConfig = getHeroConfig;