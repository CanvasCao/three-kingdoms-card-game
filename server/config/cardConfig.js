const CARD_LOCATION={
    PAIDUI:"PAIDUI"
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

const CARD_NUM_DESC = {
    1: "A",
    11: "J",
    12: "Q",
    13: "K",
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
        KEY: "SHA",
        "CN": "杀",
        "EN": "Strike",
        type: CARD_TYPE.BASIC,
    },
    "LEI_SHA": {
        KEY: "LEI_SHA",
        "CN": "雷杀",
        "EN": "Lightning Strike",
        type: CARD_TYPE.BASIC,
        attribute: CARD_ATTRIBUTE.LIGHTNING,
    },
    "HUO_SHA": {
        KEY: "HUO_SHA",
        "CN": "火杀",
        "EN": "Fire Strike",
        type: CARD_TYPE.BASIC,
        attribute: CARD_ATTRIBUTE.FIRE,
    },
    "SHAN": {
        KEY: "SHAN",
        "CN": "闪",
        "EN": "Dodge",
        type: CARD_TYPE.BASIC,
    },
    "TAO": {
        KEY: "TAO",
        "CN": "桃",
        "EN": "Peach",
        type: CARD_TYPE.BASIC,
    },
}

const IMMEDIATE_SCROLL_CARDS_CONFIG = {
    // 锦囊
    "WAN_JIAN_QI_FA": {
        KEY: "WAN_JIAN_QI_FA",
        "CN": "万箭齐发",
        "EN": "Arrow Barrage",
        type: CARD_TYPE.SCROLL,
    },
    "NAN_MAN_RU_QIN": {
        KEY: "NAN_MAN_RU_QIN",
        "CN": "南蛮入侵",
        "EN": "Barbarian Invasion",
        type: CARD_TYPE.SCROLL,
    },
    "TAO_YUAN_JIE_YI": {
        KEY: "TAO_YUAN_JIE_YI",
        "CN": "桃园结义",
        "EN": "Peach Garden",
        type: CARD_TYPE.SCROLL
    },
    "WU_ZHONG_SHENG_YOU": {
        KEY: "WU_ZHONG_SHENG_YOU",
        "CN": "无中生有",
        "EN": "Something for Nothing",
        type: CARD_TYPE.SCROLL
    },
    "WU_GU_FENG_DENG": {
        KEY: "WU_GU_FENG_DENG",
        "CN": "五谷丰登",
        "EN": "Bountiful Harvest",
        type: CARD_TYPE.SCROLL
    },
    "GUO_HE_CHAI_QIAO": {
        KEY: "GUO_HE_CHAI_QIAO",
        "CN": "过河拆桥",
        "EN": "Dismantle",
        type: CARD_TYPE.SCROLL
    },
    "SHUN_SHOU_QIAN_YANG": {
        KEY: "SHUN_SHOU_QIAN_YANG",
        "CN": "顺手牵羊",
        "EN": "Snatch",
        type: CARD_TYPE.SCROLL
    },
    "JIE_DAO_SHA_REN": {
        KEY: "JIE_DAO_SHA_REN",
        "CN": "借刀杀人",
        "EN": "Borrowed Sword",
        type: CARD_TYPE.SCROLL
    },
    "JUE_DOU": {
        KEY: "JUE_DOU",
        "CN": "决斗",
        "EN": "Duel",
        type: CARD_TYPE.SCROLL
    },
    "WU_XIE_KE_JI": {
        KEY: "WU_XIE_KE_JI",
        "CN": "无懈可击",
        "EN": "Cancel",
        type: CARD_TYPE.SCROLL
    },

    // junzheng
    "HUO_GONG": {
        KEY: "HUO_GONG",
        "CN": "火攻",
        "EN": "Fire Attack",
        type: CARD_TYPE.SCROLL,
    },
}

const DELAY_SCROLL_CARDS_CONFIG = { // 延时锦囊
    "LE_BU_SI_SHU": {
        KEY: "LE_BU_SI_SHU",
        "CN": "乐不思蜀",
        "EN": "Contentment",
        type: CARD_TYPE.SCROLL,
        isDelay: true,
    },
    "BING_LIANG_CUN_DUAN": {
        KEY: "BING_LIANG_CUN_DUAN",
        "CN": "兵粮寸断",
        "EN": "Supply Outage",
        type: CARD_TYPE.SCROLL,
        isDelay: true,
    },
    "SHAN_DIAN": {
        KEY: "SHAN_DIAN",
        "CN": "闪电",
        "EN": "Lightning",
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
        KEY: "ZHU_GE_LIAN_NU",
        "CN": "诸葛连弩",
        "EN": "Crossbow",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 1,
        distanceDesc: '一'
    },
    "CI_XIONG_SHUANG_GU_JIAN": {
        KEY: "CI_XIONG_SHUANG_GU_JIAN",
        "CN": "雌雄双股剑",
        "EN": "Binary Sword",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 2,
        distanceDesc: '二'
    },
    "GU_DIN_DAO": {
        KEY: "GU_DIN_DAO",
        "CN": "古锭刀",
        "EN": "Ancient Sword",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 2,
        distanceDesc: '二'
    },
    "QING_LONG_YAN_YUE_DAO": {
        KEY: "QING_LONG_YAN_YUE_DAO",
        "CN": "青龙偃月刀",
        "EN": "Green Dragon Sword",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 3,
        distanceDesc: '三'
    },
    "FANG_TIAN_HUA_JI": {
        KEY: "FANG_TIAN_HUA_JI",
        "CN": "方天画戟",
        "EN": "Halberd",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 4,
        distanceDesc: '四'
    },
    "HAN_BIN_JIAN": {
        KEY: "HAN_BIN_JIAN",
        "CN": "寒冰剑",
        "EN": "Ice Sword",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 2,
        distanceDesc: '二'
    },
    "GUAN_SHI_FU": {
        KEY: "GUAN_SHI_FU",
        "CN": "贯石斧",
        "EN": "Stone Axe",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 3,
        distanceDesc: '三'
    },
    "QI_LIN_GONG": {
        KEY: "QI_LIN_GONG",
        "CN": "麒麟弓",
        "EN": "Qilin Bow",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 5,
        distanceDesc: '五'
    },
    "ZHU_QUE_YU_SHAN": {
        KEY: "ZHU_QUE_YU_SHAN",
        "CN": "朱雀羽扇",
        "EN": "Fire Fan",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 4,
        distanceDesc: '四'
    },
    "QIN_GANG_JIAN": {
        KEY: "QIN_GANG_JIAN",
        "CN": "青釭剑",
        "EN": "Green Steel Sword",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 2,
        distanceDesc: '二'
    },
    "ZHANG_BA_SHE_MAO": {
        KEY: "ZHANG_BA_SHE_MAO",
        "CN": "丈八蛇矛",
        "EN": "Snake Spear",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.WEAPON,
        distance: 3,
        distanceDesc: '三'
    },
}

const SHIELD_CARDS_CONFIG = {
    // 防具
    "BA_GUA_ZHEN": {
        KEY: "BA_GUA_ZHEN",
        "CN": "八卦阵",
        "EN": "Eight Diagrams",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.SHIELD,
    },
    "REN_WANG_DUN": {
        KEY: "REN_WANG_DUN",
        "CN": "仁王盾",
        "EN": "King's Shield",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.SHIELD,
    },
    "TENG_JIA": {
        KEY: "TENG_JIA",
        "CN": "藤甲",
        "EN": "Vine Armour",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.SHIELD,
    },
    "BAI_YIN_SHI_ZI": {
        KEY: "BAI_YIN_SHI_ZI",
        "CN": "白银狮子",
        "EN": "Silver Lion",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.SHIELD,
    },
}

const PLUS_HORSE_CARDS_CONFIG = {
    // 马
    "DI_LU": {
        KEY: "DI_LU",
        "CN": "的卢",
        "EN": "Plus horse",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.PLUS_HORSE,
        horseDistance: 1,
        distanceDesc: "+1",
    }, "JUE_YING": {
        KEY: "JUE_YING",
        "CN": "绝影",
        "EN": "Plus horse",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.PLUS_HORSE,
        horseDistance: 1,
        distanceDesc: "+1",
    },
    "ZHAO_HUANG_FEI_DIAN": {
        KEY: "ZHAO_HUANG_FEI_DIAN",
        "CN": "爪黄飞电",
        "EN": "Plus horse",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.PLUS_HORSE,
        horseDistance: 1,
        distanceDesc: "+1",
    },
}
const MINUS_HORSE_CARDS_CONFIG = {
    "CHI_TU": {
        KEY: "CHI_TU",
        "CN": "赤兔",
        "EN": "Minus horse",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.MINUS_HORSE,
        horseDistance: -1,
        distanceDesc: "-1",
    },
    "DA_WAN": {
        KEY: "DA_WAN",
        "CN": "大宛",
        "EN": "Minus horse",
        type: CARD_TYPE.EQUIPMENT,
        equipmentType: EQUIPMENT_TYPE.MINUS_HORSE,
        horseDistance: -1,
        distanceDesc: "-1",
    },
    "ZI_XING": {
        KEY: "ZI_XING",
        "CN": "紫骍",
        "EN": "Minus horse",
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

exports.CARD_LOCATION = CARD_LOCATION;
exports.CARD_HUASE = CARD_HUASE;
exports.CARD_COLOR = CARD_COLOR;
exports.CARD_NUM_DESC = CARD_NUM_DESC;
exports.CARD_CONFIG = CARD_CONFIG;
exports.CARD_TYPE = CARD_TYPE;
exports.BASIC_CARDS_CONFIG = BASIC_CARDS_CONFIG;
exports.SCROLL_CARDS_CONFIG = SCROLL_CARDS_CONFIG;
exports.DELAY_SCROLL_CARDS_CONFIG = DELAY_SCROLL_CARDS_CONFIG;
exports.IMMEDIATE_SCROLL_CARDS_CONFIG = IMMEDIATE_SCROLL_CARDS_CONFIG;
exports.EQUIPMENT_CARDS_CONFIG = EQUIPMENT_CARDS_CONFIG;
exports.EQUIPMENT_TYPE = EQUIPMENT_TYPE;