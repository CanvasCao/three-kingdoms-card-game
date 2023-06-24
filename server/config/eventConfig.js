// https://gltjk.com/sanguosha/rules/flow/use.html
const USE_EVENT_TIMING = {
    //【丈八蛇矛】、【朱雀羽扇①】、【倾国】、【断粮①】、【急袭】、【奇策】、【慎断】的转化效果、【武圣】、【武圣（阵）】、【龙胆】
    "WHEN_SELECTING_CARD_AND_TARGET": "WHEN_SELECTING_CARD_AND_TARGET",

    //【集智】
    "WHEN_USING": "WHEN_USING",

    //【奋威】
    "WHEN_SPECIFYING_TARGET": "WHEN_SPECIFYING_TARGET",

    //【享乐】、【流离】
    "WHEN_BECOMING_TARGET": "WHEN_BECOMING_TARGET",

    //【铁骑】、【烈弓】 装备技能：【青釭剑】、【雌雄双股剑】
    "AFTER_SPECIFYING_TARGET": "AFTER_SPECIFYING_TARGET",

    // 【无双②】
    "AFTER_BECOMING_TARGET": "AFTER_BECOMING_TARGET",

    /**
     * 锦囊的无懈可击 在这一步
     **/

    // 使用结算开始时：须检测此牌对目标的有效性。
    // 能产生影响的技能：【仁王盾】、【藤甲①】、【毅重】、【贞烈】、【啖酪】、【祸首①】、【蛮裔②】
    "WHEN_SETTLEMENT_BEGINS": "WHEN_SETTLEMENT_BEGINS",

    // 响应的结果可能会令此牌被抵消，即此牌对目标不生效，“生效前”终止，然后跳过“生效时”和“生效后”。
    //【杀】被抵消时能发动的技能/会执行的效果：a.武将技能：【忠勇】、【虎啸】、【猛进】、【谋溃】“你令其弃置你的一张牌”的效果。b.装备技能：【贯石斧】、【青龙偃月刀】。
    "BEFORE_TAKE_EFFECT": "BEFORE_TAKE_EFFECT",

    // 若此牌未被抵消，确定将会生效。
    // 能发动的技能：【谦逊】。
    "WHEN_TAKE_EFFECT": "WHEN_TAKE_EFFECT",

    "AFTER_TAKE_EFFECT": "AFTER_TAKE_EFFECT",
}

const USE_STRIKE_EVENT_TIMINGS = [
    // USE_EVENT_TIMING.WHEN_SELECTING_CARD_AND_TARGET,
    // USE_EVENT_TIMING.WHEN_USING,
    // USE_EVENT_TIMING.WHEN_SPECIFYING_TARGET,
    USE_EVENT_TIMING.WHEN_BECOMING_TARGET, // 【流离】
    USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET, // 【铁骑】【烈弓】【雌雄双股剑】
    // USE_EVENT_TIMING.AFTER_BECOMING_TARGET, // 【贞烈】

    USE_EVENT_TIMING.WHEN_SETTLEMENT_BEGINS,// 【仁王盾】【藤甲①】 如目标无效 本事件终止 若有效生成闪Responses
    // USE_EVENT_TIMING.BEFORE_TAKE_EFFECT, // 如被响应才会触发【贯石斧】、【青龙偃月刀】若没有触发【贯石斧】、【青龙偃月刀】生成伤害事件
    // USE_EVENT_TIMING.WHEN_TAKE_EFFECT,
    // USE_EVENT_TIMING.AFTER_TAKE_EFFECT, // 生成伤害和铁索连环事件 此事件进入弃牌堆
]

// https://gltjk.com/sanguosha/rules/flow/judge.html
const PANDING_EVENT_TIMING = {
    //【咒缚】
    "WHEN_PANDING": "WHEN_PANDING",

    //【鬼才】、【鬼道】
    "BEFORE_PANDING_TAKE_EFFECT": "BEFORE_PANDING_TAKE_EFFECT",

    // 【天妒】、【洛神】
    "AFTER_PANDING_TAKE_EFFECT": "AFTER_PANDING_TAKE_EFFECT",
}

const PANDING_EVENT_TIMINGS = [
    // PANDING_EVENT_TIMING.WHEN_PANDING, // 【咒缚】
    PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT, // 【鬼才】、【鬼道】
    PANDING_EVENT_TIMING.AFTER_PANDING_TAKE_EFFECT, // 【天妒】、【洛神】
]


exports.USE_EVENT_TIMING = USE_EVENT_TIMING;
exports.USE_EVENT_TIMINGS = USE_STRIKE_EVENT_TIMINGS;
exports.PANDING_EVENT_TIMING = PANDING_EVENT_TIMING;
exports.PANDING_EVENT_TIMINGS = PANDING_EVENT_TIMINGS;
