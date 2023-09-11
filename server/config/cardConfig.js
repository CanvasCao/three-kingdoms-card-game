const CARD_LOCATION = {
    PAIDUI: "PAIDUI",
    TABLE: "TABLE",
    PLAYER: "PLAYER",
}

const CARD_HUASE = {
    HEITAO: "♠",
    CAOHUA: '♣',
    FANGKUAI: '♦',
    HONGTAO: '♥',
}

const CARD_COLOR = {
    BLACK: "black",
    NO: 'no',
    RED: 'red'
}

const CARD_TYPE = {
    EQUIPMENT: "EQUIPMENT",
    SCROLL: "SCROLL",
    BASIC: "BASIC",
}

const CARD_ATTRIBUTE = {
    LIGHTNING: "LIGHTNING",
    FIRE: "FIRE",
}

const EQUIPMENT_TYPE = {
    WEAPON: "WEAPON",
    SHIELD: "SHIELD",
    PLUS_HORSE: "PLUS_HORSE",
    MINUS_HORSE: "MINUS_HORSE",
}

const BASIC_CARDS_CONFIG = {
    "SHA": {
        key: "SHA",
        type: CARD_TYPE.BASIC,
    },
    "LEI_SHA": {
        key: "LEI_SHA",
        type: CARD_TYPE.BASIC,
        attribute: CARD_ATTRIBUTE.LIGHTNING,
    },
    "HUO_SHA": {
        key: "HUO_SHA",
        type: CARD_TYPE.BASIC,
        attribute: CARD_ATTRIBUTE.FIRE,
    },
    "SHAN": {
        key: "SHAN",
        type: CARD_TYPE.BASIC,
    },
    "TAO": {
        key: "TAO",
        type: CARD_TYPE.BASIC,
    },
    "JIU": {
        key: "JIU",
        type: CARD_TYPE.BASIC
    },
}

const IMMEDIATE_SCROLL_CARDS_CONFIG = {
    // 锦囊
    "WAN_JIAN_QI_FA": {
        key: "WAN_JIAN_QI_FA",
        type: CARD_TYPE.SCROLL,
    },
    "NAN_MAN_RU_QIN": {
        key: "NAN_MAN_RU_QIN",
        type: CARD_TYPE.SCROLL,
    },
    "TAO_YUAN_JIE_YI": {
        key: "TAO_YUAN_JIE_YI",
        type: CARD_TYPE.SCROLL
    },
    "WU_ZHONG_SHENG_YOU": {
        key: "WU_ZHONG_SHENG_YOU",
        type: CARD_TYPE.SCROLL
    },
    "WU_GU_FENG_DENG": {
        key: "WU_GU_FENG_DENG",
        type: CARD_TYPE.SCROLL
    },
    "GUO_HE_CHAI_QIAO": {
        key: "GUO_HE_CHAI_QIAO",
        type: CARD_TYPE.SCROLL
    },
    "SHUN_SHOU_QIAN_YANG": {
        key: "SHUN_SHOU_QIAN_YANG",
        type: CARD_TYPE.SCROLL
    },
    "JIE_DAO_SHA_REN": {
        key: "JIE_DAO_SHA_REN",
        type: CARD_TYPE.SCROLL
    },
    "JUE_DOU": {
        key: "JUE_DOU",
        type: CARD_TYPE.SCROLL
    },
    "WU_XIE_KE_JI": {
        key: "WU_XIE_KE_JI",
        type: CARD_TYPE.SCROLL
    },

    // junzheng
    "HUO_GONG": {
        key: "HUO_GONG",
        type: CARD_TYPE.SCROLL,
    },
}

const DELAY_SCROLL_CARDS_CONFIG = { // 延时锦囊
    "LE_BU_SI_SHU": {
        key: "LE_BU_SI_SHU",
        type: CARD_TYPE.SCROLL,
        isDelay: true,
    },
    "BING_LIANG_CUN_DUAN": {
        key: "BING_LIANG_CUN_DUAN",
        type: CARD_TYPE.SCROLL,
        isDelay: true,
    },
    "SHAN_DIAN": {
        key: "SHAN_DIAN",
        type: CARD_TYPE.SCROLL,
        isDelay: true,
    }
}
const SCROLL_CARDS_CONFIG = {
    ...IMMEDIATE_SCROLL_CARDS_CONFIG,
    ...DELAY_SCROLL_CARDS_CONFIG,
}
const WEAPON_CARDS_CONFIG = {
    // 武器
    "ZHU_GE_LIAN_NU": {
        key: "ZHU_GE_LIAN_NU",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 1,
        distanceDesc: '一'
    },
    "CI_XIONG_SHUANG_GU_JIAN": {
        key: "CI_XIONG_SHUANG_GU_JIAN",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 2,
        distanceDesc: '二'
    },
    "GU_DIN_DAO": {
        key: "GU_DIN_DAO",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 2,
        distanceDesc: '二'
    },
    "QING_LONG_YAN_YUE_DAO": {
        key: "QING_LONG_YAN_YUE_DAO",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 3,
        distanceDesc: '三'
    },
    "FANG_TIAN_HUA_JI": {
        key: "FANG_TIAN_HUA_JI",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 4,
        distanceDesc: '四'
    },
    "HAN_BIN_JIAN": {
        key: "HAN_BIN_JIAN",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 2,
        distanceDesc: '二'
    },
    "GUAN_SHI_FU": {
        key: "GUAN_SHI_FU",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 3,
        distanceDesc: '三'
    },
    "QI_LIN_GONG": {
        key: "QI_LIN_GONG",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 5,
        distanceDesc: '五'
    },
    "ZHU_QUE_YU_SHAN": {
        key: "ZHU_QUE_YU_SHAN",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 4,
        distanceDesc: '四'
    },
    "QIN_GANG_JIAN": {
        key: "QIN_GANG_JIAN",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 2,
        distanceDesc: '二'
    },
    "ZHANG_BA_SHE_MAO": {
        key: "ZHANG_BA_SHE_MAO",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 3,
        distanceDesc: '三'
    },
}

const SHIELD_CARDS_CONFIG = {
    // 防具
    "BA_GUA_ZHEN": {
        key: "BA_GUA_ZHEN",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.SHIELD,
    },
    "REN_WANG_DUN": {
        key: "REN_WANG_DUN",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.SHIELD,
    },
    "TENG_JIA": {
        key: "TENG_JIA",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.SHIELD,
    },
    "BAI_YIN_SHI_ZI": {
        key: "BAI_YIN_SHI_ZI",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.SHIELD,
    },
}

const PLUS_HORSE_CARDS_CONFIG = {
    // 马
    "DI_LU": {
        key: "DI_LU",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.PLUS_HORSE,
        horseDistance: 1,
        distanceDesc: "+1",
    }, "JUE_YING": {
        key: "JUE_YING",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.PLUS_HORSE,
        horseDistance: 1,
        distanceDesc: "+1",
    },
    "ZHAO_HUANG_FEI_DIAN": {
        key: "ZHAO_HUANG_FEI_DIAN",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.PLUS_HORSE,
        horseDistance: 1,
        distanceDesc: "+1",
    },
}
const MINUS_HORSE_CARDS_CONFIG = {
    "CHI_TU": {
        key: "CHI_TU",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.MINUS_HORSE,
        horseDistance: -1,
        distanceDesc: "-1",
    },
    "DA_WAN": {
        key: "DA_WAN",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.MINUS_HORSE,
        horseDistance: -1,
        distanceDesc: "-1",
    },
    "ZI_XING": {
        key: "ZI_XING",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.MINUS_HORSE,
        horseDistance: -1,
        distanceDesc: "-1",
    },
}

const EQUIPMENT_CARDS_CONFIG = {
    ...WEAPON_CARDS_CONFIG,
    ...SHIELD_CARDS_CONFIG,
    ...PLUS_HORSE_CARDS_CONFIG,
    ...MINUS_HORSE_CARDS_CONFIG,
}

const CARD_CONFIG = {
    ...BASIC_CARDS_CONFIG,
    ...SCROLL_CARDS_CONFIG,
    ...EQUIPMENT_CARDS_CONFIG,
}

const ALL_SHA_CARD_KEYS = [
    CARD_CONFIG.SHA.key,
    CARD_CONFIG.LEI_SHA.key,
    CARD_CONFIG.HUO_SHA.key,
]

exports.ALL_SHA_CARD_KEYS = ALL_SHA_CARD_KEYS;
exports.CARD_LOCATION = CARD_LOCATION;
exports.CARD_HUASE = CARD_HUASE;
exports.CARD_COLOR = CARD_COLOR;
exports.CARD_CONFIG = CARD_CONFIG;
exports.CARD_TYPE = CARD_TYPE;
exports.CARD_ATTRIBUTE = CARD_ATTRIBUTE;
exports.BASIC_CARDS_CONFIG = BASIC_CARDS_CONFIG;
exports.SCROLL_CARDS_CONFIG = SCROLL_CARDS_CONFIG;
exports.DELAY_SCROLL_CARDS_CONFIG = DELAY_SCROLL_CARDS_CONFIG;
exports.IMMEDIATE_SCROLL_CARDS_CONFIG = IMMEDIATE_SCROLL_CARDS_CONFIG;
exports.EQUIPMENT_CARDS_CONFIG = EQUIPMENT_CARDS_CONFIG;
exports.EQUIPMENT_TYPE = EQUIPMENT_TYPE;