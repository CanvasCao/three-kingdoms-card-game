const {CARD_NUM_DESC, CARD_CONFIG, CARD_HUASE} = require("./config/cardConfig");
const {Card} = require("./model/Card");
const {v4: uuidv4} = require('uuid');
const {shuffle} = require('./utils/emitUtils');

let standardCardMetaList = [
    {'huase': CARD_HUASE.HEITAO, number: 1, key: CARD_CONFIG.SHAN_DIAN.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 1, key: CARD_CONFIG.TAO_YUAN_JIE_YI.KEY},
    {'huase': CARD_HUASE.CAOHUA, number: 1, key: CARD_CONFIG.ZHU_GE_LIAN_NU.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 1, key: CARD_CONFIG.ZHU_GE_LIAN_NU.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 1, key: CARD_CONFIG.JUE_DOU.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 1, key: CARD_CONFIG.WAN_JIAN_QI_FA.KEY},
    {'huase': CARD_HUASE.CAOHUA, number: 1, key: CARD_CONFIG.JUE_DOU.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 1, key: CARD_CONFIG.JUE_DOU.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.BA_GUA_ZHEN.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 2, key: CARD_CONFIG.SHAN.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.BA_GUA_ZHEN.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 2, key: CARD_CONFIG.SHAN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.CI_XIONG_SHUANG_GU_JIAN.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 2, key: CARD_CONFIG.SHAN.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 2, key: CARD_CONFIG.SHAN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.HAN_BIN_JIAN.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.REN_WANG_DUN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 3, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 3, key: CARD_CONFIG.TAO.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 3, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 3, key: CARD_CONFIG.SHAN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 3, key: CARD_CONFIG.SHUN_SHOU_QIAN_YANG.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 3, key: CARD_CONFIG.WU_GU_FENG_DENG.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 3, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 3, key: CARD_CONFIG.SHUN_SHOU_QIAN_YANG.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 4, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 4, key: CARD_CONFIG.TAO.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 4, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 4, key: CARD_CONFIG.SHAN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 4, key: CARD_CONFIG.SHUN_SHOU_QIAN_YANG.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 4, key: CARD_CONFIG.WU_GU_FENG_DENG.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 4, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 4, key: CARD_CONFIG.SHUN_SHOU_QIAN_YANG.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 5, key: CARD_CONFIG.QING_LONG_YAN_YUE_DAO.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 5, key: CARD_CONFIG.QI_LIN_GONG.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 5, key: CARD_CONFIG.DI_LU.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 5, key: CARD_CONFIG.SHAN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 5, key: CARD_CONFIG.JUE_YING.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 5, key: CARD_CONFIG.CHI_TU.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 5, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 5, key: CARD_CONFIG.GUAN_SHI_FU.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 6, key: CARD_CONFIG.LE_BU_SI_SHU.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 6, key: CARD_CONFIG.TAO.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 6, key: CARD_CONFIG.LE_BU_SI_SHU.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 6, key: CARD_CONFIG.SHAN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 6, key: CARD_CONFIG.QIN_GANG_JIAN.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 6, key: CARD_CONFIG.LE_BU_SI_SHU.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 6, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 6, key: CARD_CONFIG.SHA.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 7, key: CARD_CONFIG.NAN_MAN_RU_QIN.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 7, key: CARD_CONFIG.TAO.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 7, key: CARD_CONFIG.NAN_MAN_RU_QIN.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 7, key: CARD_CONFIG.SHAN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 7, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 7, key: CARD_CONFIG.WU_ZHONG_SHENG_YOU.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 7, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 7, key: CARD_CONFIG.SHA.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 8, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 8, key: CARD_CONFIG.TAO.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 8, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 8, key: CARD_CONFIG.SHAN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 8, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 8, key: CARD_CONFIG.WU_ZHONG_SHENG_YOU.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 8, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 8, key: CARD_CONFIG.SHA.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 9, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 9, key: CARD_CONFIG.TAO.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 9, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 9, key: CARD_CONFIG.SHAN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 9, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 9, key: CARD_CONFIG.WU_ZHONG_SHENG_YOU.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 9, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 9, key: CARD_CONFIG.SHA.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 10, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 10, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 10, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 10, key: CARD_CONFIG.SHAN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 10, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 10, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 10, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 10, key: CARD_CONFIG.SHA.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 11, key: CARD_CONFIG.WU_XIE_KE_JI.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 11, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 11, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 11, key: CARD_CONFIG.SHAN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 11, key: CARD_CONFIG.SHUN_SHOU_QIAN_YANG.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 11, key: CARD_CONFIG.WU_ZHONG_SHENG_YOU.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 11, key: CARD_CONFIG.SHA.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 11, key: CARD_CONFIG.SHAN.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 12, key: CARD_CONFIG.ZHANG_BA_SHE_MAO.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 12, key: CARD_CONFIG.TAO.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 12, key: CARD_CONFIG.JIE_DAO_SHA_REN.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.TAO.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 12, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 12, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 12, key: CARD_CONFIG.WU_XIE_KE_JI.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.FANG_TIAN_HUA_JI.KEY},

    {'huase': CARD_HUASE.HONGTAO, number: 12, key: CARD_CONFIG.SHAN_DIAN.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.WU_XIE_KE_JI.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 13, key: CARD_CONFIG.DA_WAN.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 13, key: CARD_CONFIG.ZHAO_HUANG_FEI_DIAN.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 13, key: CARD_CONFIG.JIE_DAO_SHA_REN.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 13, key: CARD_CONFIG.SHA.KEY},

    {'huase': CARD_HUASE.HEITAO, number: 13, key: CARD_CONFIG.NAN_MAN_RU_QIN.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 13, key: CARD_CONFIG.SHAN.KEY},
    {'huase': CARD_HUASE.HEITAO, number: 13, key: CARD_CONFIG.WU_XIE_KE_JI.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 13, key: CARD_CONFIG.ZI_XING.KEY},
]

let junzhengCardMetaList = [
    {'huase': CARD_HUASE.HEITAO, number: 1, key: CARD_CONFIG.LEI_SHA.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 1, key: CARD_CONFIG.HUO_SHA.KEY},
]

let testCardMetaList = [
    // {'huase': CARD_HUASE.HONGTAO, number: 13, key: CARD_CONFIG.SHA.KEY},
    // {'huase': CARD_HUASE.HEITAO, number: 1, key: CARD_CONFIG.LEI_SHA.KEY},
    {'huase': CARD_HUASE.HONGTAO, number: 1, key: CARD_CONFIG.HUO_SHA.KEY},
    // {'huase': CARD_HUASE.HONGTAO, number: 8, key: CARD_CONFIG.SHAN.KEY},
    // {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.TAO.KEY},
    // {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.TAO.KEY},
    // {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.BA_GUA_ZHEN.KEY},
    // {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.REN_WANG_DUN.KEY},
    // {'huase': CARD_HUASE.FANGKUAI, number: 13, key: CARD_CONFIG.ZHAO_HUANG_FEI_DIAN.KEY},
    // {'huase': CARD_HUASE.CAOHUA, number: 12, key: CARD_CONFIG.ZHANG_BA_SHE_MAO.KEY},
    // {'huase': CARD_HUASE.CAOHUA, number: 13, key: CARD_CONFIG.DA_WAN.KEY},
    // {'huase': CARD_HUASE.CAOHUA, number: 1, key: CARD_CONFIG.ZHU_GE_LIAN_NU.KEY},
    // {'huase': CARD_HUASE.CAOHUA, number: 5, key: CARD_CONFIG.QING_LONG_YAN_YUE_DAO.KEY},

    // {'huase': CARD_HUASE.HEITAO, number: 1, key: CARD_CONFIG.SHAN_DIAN.KEY},
    // {'huase': CARD_HUASE.FANGKUAI, number: 6, key: CARD_CONFIG.LE_BU_SI_SHU.KEY},
    {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.KEY},
    // {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.SHUN_SHOU_QIAN_YANG.KEY},
    // {'huase': CARD_HUASE.FANGKUAI, number: 11, key: CARD_CONFIG.WU_ZHONG_SHENG_YOU.KEY},
    // {'huase': CARD_HUASE.FANGKUAI, number: 11, key: CARD_CONFIG.WU_ZHONG_SHENG_YOU.KEY},
    // {'huase': CARD_HUASE.HEITAO, number: 1, key: CARD_CONFIG.JUE_DOU.KEY},

    // {'huase': CARD_HUASE.CAOHUA, number: 13, key: CARD_CONFIG.NAN_MAN_RU_QIN.KEY},
    // {'huase': CARD_HUASE.HONGTAO, number: 1, key: CARD_CONFIG.WAN_JIAN_QI_FA.KEY},
    // {'huase': CARD_HUASE.HONGTAO, number: 1, key: CARD_CONFIG.TAO_YUAN_JIE_YI.KEY},
    // {'huase': CARD_HUASE.HEITAO, number: 13, key: CARD_CONFIG.JIE_DAO_SHA_REN.KEY},
    // {'huase': CARD_HUASE.HEITAO, number: 13, key: CARD_CONFIG.WU_XIE_KE_JI.KEY},
    // {'huase': CARD_HUASE.FANGKUAI, number: 4, key: CARD_CONFIG.WU_GU_FENG_DENG.KEY},
]

const metaList = process.env.NODE_ENV == 'production' ? standardCardMetaList : testCardMetaList;

const getInitCards = () => {
    const shuffled = shuffle(metaList);

    return shuffled.map(card => {
        card = {
            ...card,
            ...CARD_CONFIG[card.key],
            cardId: uuidv4(),
            cardNumDesc: CARD_NUM_DESC[card.number] ? CARD_NUM_DESC[card.number] : card.number,
        }
        return new Card(card);
    })
}

exports.getInitCards = getInitCards;
