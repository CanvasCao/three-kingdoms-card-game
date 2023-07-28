const {CARD_CONFIG, CARD_HUASE} = require("./config/cardConfig");
const {Card} = require("./model/Card");
const {v4: uuidv4} = require('uuid');
const {shuffle} = require("lodash/collection");


let standardCardMetaList = [
    {'huase': CARD_HUASE.HEITAO, number: 1, key: CARD_CONFIG.SHAN_DIAN.key},
    {'huase': CARD_HUASE.HONGTAO, number: 1, key: CARD_CONFIG.TAO_YUAN_JIE_YI.key},
    {'huase': CARD_HUASE.CAOHUA, number: 1, key: CARD_CONFIG.ZHU_GE_LIAN_NU.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 1, key: CARD_CONFIG.ZHU_GE_LIAN_NU.key},

    {'huase': CARD_HUASE.HEITAO, number: 1, key: CARD_CONFIG.JUE_DOU.key},
    {'huase': CARD_HUASE.HONGTAO, number: 1, key: CARD_CONFIG.WAN_JIAN_QI_FA.key},
    {'huase': CARD_HUASE.CAOHUA, number: 1, key: CARD_CONFIG.JUE_DOU.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 1, key: CARD_CONFIG.JUE_DOU.key},

    {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.BA_GUA_ZHEN.key},
    {'huase': CARD_HUASE.HONGTAO, number: 2, key: CARD_CONFIG.SHAN.key},
    {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.BA_GUA_ZHEN.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 2, key: CARD_CONFIG.SHAN.key},

    {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.CI_XIONG_SHUANG_GU_JIAN.key},
    {'huase': CARD_HUASE.HONGTAO, number: 2, key: CARD_CONFIG.SHAN.key},
    {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 2, key: CARD_CONFIG.SHAN.key},

    {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.HAN_BIN_JIAN.key},
    {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.REN_WANG_DUN.key},

    {'huase': CARD_HUASE.HEITAO, number: 3, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.key},
    {'huase': CARD_HUASE.HONGTAO, number: 3, key: CARD_CONFIG.TAO.key},
    {'huase': CARD_HUASE.HEITAO, number: 3, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 3, key: CARD_CONFIG.SHAN.key},

    {'huase': CARD_HUASE.HEITAO, number: 3, key: CARD_CONFIG.SHUN_SHOU_QIAN_YANG.key},
    {'huase': CARD_HUASE.HONGTAO, number: 3, key: CARD_CONFIG.WU_GU_FENG_DENG.key},
    {'huase': CARD_HUASE.HEITAO, number: 3, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 3, key: CARD_CONFIG.SHUN_SHOU_QIAN_YANG.key},

    {'huase': CARD_HUASE.HEITAO, number: 4, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.key},
    {'huase': CARD_HUASE.HONGTAO, number: 4, key: CARD_CONFIG.TAO.key},
    {'huase': CARD_HUASE.HEITAO, number: 4, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 4, key: CARD_CONFIG.SHAN.key},

    {'huase': CARD_HUASE.HEITAO, number: 4, key: CARD_CONFIG.SHUN_SHOU_QIAN_YANG.key},
    {'huase': CARD_HUASE.HONGTAO, number: 4, key: CARD_CONFIG.WU_GU_FENG_DENG.key},
    {'huase': CARD_HUASE.HEITAO, number: 4, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 4, key: CARD_CONFIG.SHUN_SHOU_QIAN_YANG.key},

    {'huase': CARD_HUASE.HEITAO, number: 5, key: CARD_CONFIG.QING_LONG_YAN_YUE_DAO.key},
    {'huase': CARD_HUASE.HONGTAO, number: 5, key: CARD_CONFIG.QI_LIN_GONG.key},
    {'huase': CARD_HUASE.HEITAO, number: 5, key: CARD_CONFIG.DI_LU.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 5, key: CARD_CONFIG.SHAN.key},

    {'huase': CARD_HUASE.HEITAO, number: 5, key: CARD_CONFIG.JUE_YING.key},
    {'huase': CARD_HUASE.HONGTAO, number: 5, key: CARD_CONFIG.CHI_TU.key},
    {'huase': CARD_HUASE.HEITAO, number: 5, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 5, key: CARD_CONFIG.GUAN_SHI_FU.key},

    {'huase': CARD_HUASE.HEITAO, number: 6, key: CARD_CONFIG.LE_BU_SI_SHU.key},
    {'huase': CARD_HUASE.HONGTAO, number: 6, key: CARD_CONFIG.TAO.key},
    {'huase': CARD_HUASE.HEITAO, number: 6, key: CARD_CONFIG.LE_BU_SI_SHU.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 6, key: CARD_CONFIG.SHAN.key},

    {'huase': CARD_HUASE.HEITAO, number: 6, key: CARD_CONFIG.QIN_GANG_JIAN.key},
    {'huase': CARD_HUASE.HONGTAO, number: 6, key: CARD_CONFIG.LE_BU_SI_SHU.key},
    {'huase': CARD_HUASE.HEITAO, number: 6, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 6, key: CARD_CONFIG.SHA.key},

    {'huase': CARD_HUASE.HEITAO, number: 7, key: CARD_CONFIG.NAN_MAN_RU_QIN.key},
    {'huase': CARD_HUASE.HONGTAO, number: 7, key: CARD_CONFIG.TAO.key},
    {'huase': CARD_HUASE.HEITAO, number: 7, key: CARD_CONFIG.NAN_MAN_RU_QIN.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 7, key: CARD_CONFIG.SHAN.key},

    {'huase': CARD_HUASE.HEITAO, number: 7, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HONGTAO, number: 7, key: CARD_CONFIG.WU_ZHONG_SHENG_YOU.key},
    {'huase': CARD_HUASE.HEITAO, number: 7, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 7, key: CARD_CONFIG.SHA.key},

    {'huase': CARD_HUASE.HEITAO, number: 8, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HONGTAO, number: 8, key: CARD_CONFIG.TAO.key},
    {'huase': CARD_HUASE.HEITAO, number: 8, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 8, key: CARD_CONFIG.SHAN.key},

    {'huase': CARD_HUASE.HEITAO, number: 8, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HONGTAO, number: 8, key: CARD_CONFIG.WU_ZHONG_SHENG_YOU.key},
    {'huase': CARD_HUASE.HEITAO, number: 8, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 8, key: CARD_CONFIG.SHA.key},

    {'huase': CARD_HUASE.HEITAO, number: 9, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HONGTAO, number: 9, key: CARD_CONFIG.TAO.key},
    {'huase': CARD_HUASE.HEITAO, number: 9, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 9, key: CARD_CONFIG.SHAN.key},

    {'huase': CARD_HUASE.HEITAO, number: 9, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HONGTAO, number: 9, key: CARD_CONFIG.WU_ZHONG_SHENG_YOU.key},
    {'huase': CARD_HUASE.HEITAO, number: 9, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 9, key: CARD_CONFIG.SHA.key},

    {'huase': CARD_HUASE.HEITAO, number: 10, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HONGTAO, number: 10, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HEITAO, number: 10, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 10, key: CARD_CONFIG.SHAN.key},

    {'huase': CARD_HUASE.HEITAO, number: 10, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HONGTAO, number: 10, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HEITAO, number: 10, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 10, key: CARD_CONFIG.SHA.key},

    {'huase': CARD_HUASE.HEITAO, number: 11, key: CARD_CONFIG.WU_XIE_KE_JI.key},
    {'huase': CARD_HUASE.HONGTAO, number: 11, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HEITAO, number: 11, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 11, key: CARD_CONFIG.SHAN.key},

    {'huase': CARD_HUASE.HEITAO, number: 11, key: CARD_CONFIG.SHUN_SHOU_QIAN_YANG.key},
    {'huase': CARD_HUASE.HONGTAO, number: 11, key: CARD_CONFIG.WU_ZHONG_SHENG_YOU.key},
    {'huase': CARD_HUASE.HEITAO, number: 11, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 11, key: CARD_CONFIG.SHAN.key},

    {'huase': CARD_HUASE.HEITAO, number: 12, key: CARD_CONFIG.ZHANG_BA_SHE_MAO.key},
    {'huase': CARD_HUASE.HONGTAO, number: 12, key: CARD_CONFIG.TAO.key},
    {'huase': CARD_HUASE.HEITAO, number: 12, key: CARD_CONFIG.JIE_DAO_SHA_REN.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.TAO.key},

    {'huase': CARD_HUASE.HEITAO, number: 12, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.key},
    {'huase': CARD_HUASE.HONGTAO, number: 12, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.key},
    {'huase': CARD_HUASE.HEITAO, number: 12, key: CARD_CONFIG.WU_XIE_KE_JI.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.FANG_TIAN_HUA_JI.key},

    {'huase': CARD_HUASE.HONGTAO, number: 12, key: CARD_CONFIG.SHAN_DIAN.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.WU_XIE_KE_JI.key},

    {'huase': CARD_HUASE.HEITAO, number: 13, key: CARD_CONFIG.DA_WAN.key},
    {'huase': CARD_HUASE.HONGTAO, number: 13, key: CARD_CONFIG.ZHAO_HUANG_FEI_DIAN.key},
    {'huase': CARD_HUASE.HEITAO, number: 13, key: CARD_CONFIG.JIE_DAO_SHA_REN.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 13, key: CARD_CONFIG.SHA.key},

    {'huase': CARD_HUASE.HEITAO, number: 13, key: CARD_CONFIG.NAN_MAN_RU_QIN.key},
    {'huase': CARD_HUASE.HONGTAO, number: 13, key: CARD_CONFIG.SHAN.key},
    {'huase': CARD_HUASE.HEITAO, number: 13, key: CARD_CONFIG.WU_XIE_KE_JI.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 13, key: CARD_CONFIG.ZI_XING.key},
]

let junzhengCardMetaList = [
    {'huase': CARD_HUASE.HEITAO, number: 1, key: CARD_CONFIG.LEI_SHA.key},
    {'huase': CARD_HUASE.HONGTAO, number: 1, key: CARD_CONFIG.HUO_SHA.key},
]

let testCardMetaList = [
    // 基本
    {'huase': CARD_HUASE.HONGTAO, number: 13, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HONGTAO, number: 13, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HONGTAO, number: 13, key: CARD_CONFIG.SHA.key},
    {'huase': CARD_HUASE.HONGTAO, number: 13, key: CARD_CONFIG.SHA.key},
    // {'huase': CARD_HUASE.HEITAO, number: 1, key: CARD_CONFIG.LEI_SHA.key},
    // {'huase': CARD_HUASE.HONGTAO, number: 1, key: CARD_CONFIG.HUO_SHA.key},
    // {'huase': CARD_HUASE.HONGTAO, number: 8, key: CARD_CONFIG.SHAN.key},
    // {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.TAO.key},

    // 防具
    // {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.BA_GUA_ZHEN.key},
    // {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.REN_WANG_DUN.key},

    // 武器
    // {'huase': CARD_HUASE.CAOHUA, number: 1, key: CARD_CONFIG.ZHU_GE_LIAN_NU.key},
    // {'huase': CARD_HUASE.CAOHUA, number: 5, key: CARD_CONFIG.ZHANG_BA_SHE_MAO.key},
    // {'huase': CARD_HUASE.CAOHUA, number: 5, key: CARD_CONFIG.QING_LONG_YAN_YUE_DAO.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.CI_XIONG_SHUANG_GU_JIAN.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.CI_XIONG_SHUANG_GU_JIAN.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.CI_XIONG_SHUANG_GU_JIAN.key},
    {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.CI_XIONG_SHUANG_GU_JIAN.key},

    // 马
    // {'huase': CARD_HUASE.FANGKUAI, number: 13, key: CARD_CONFIG.ZHAO_HUANG_FEI_DIAN.key},
    // {'huase': CARD_HUASE.CAOHUA, number: 13, key: CARD_CONFIG.DA_WAN.key},

    // 延时
    // {'huase': CARD_HUASE.HEITAO, number: 2, key: CARD_CONFIG.SHAN_DIAN.key},
    // {'huase': CARD_HUASE.FANGKUAI, number: 6, key: CARD_CONFIG.LE_BU_SI_SHU.key},

    // 锦囊
    // {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.GUO_HE_CHAI_QIAO.key},
    // {'huase': CARD_HUASE.FANGKUAI, number: 12, key: CARD_CONFIG.SHUN_SHOU_QIAN_YANG.key},
    // {'huase': CARD_HUASE.FANGKUAI, number: 11, key: CARD_CONFIG.WU_ZHONG_SHENG_YOU.key},
    // {'huase': CARD_HUASE.HEITAO, number: 1, key: CARD_CONFIG.JUE_DOU.key},
    // {'huase': CARD_HUASE.CAOHUA, number: 13, key: CARD_CONFIG.NAN_MAN_RU_QIN.key},
    // {'huase': CARD_HUASE.HONGTAO, number: 1, key: CARD_CONFIG.WAN_JIAN_QI_FA.key},
    // {'huase': CARD_HUASE.HONGTAO, number: 1, key: CARD_CONFIG.TAO_YUAN_JIE_YI.key},
    // {'huase': CARD_HUASE.HEITAO, number: 13, key: CARD_CONFIG.JIE_DAO_SHA_REN.key},
    // {'huase': CARD_HUASE.FANGKUAI, number: 4, key: CARD_CONFIG.WU_GU_FENG_DENG.key},

    //无懈可击
    // {'huase': CARD_HUASE.HEITAO, number: 13, key: CARD_CONFIG.WU_XIE_KE_JI.key},

]

const metaList = process.env.NODE_ENV == 'production' ? standardCardMetaList :testCardMetaList// testCardMetaList;

const getInitCards = () => {
    const shuffled = shuffle(metaList);

    return shuffled.map(card => {
       const  newCard = {
            ...card,
            ...CARD_CONFIG[card.key],
            cardId: uuidv4(),
        }
        return new Card(newCard);
    })
}

exports.getInitCards = getInitCards;
