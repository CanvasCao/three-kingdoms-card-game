// https://gltjk.com/sanguosha/rules/flow/use.html
const USE_EVENT_TIMING = {
    //【丈八蛇矛】、【朱雀羽扇①】、【倾国】、【断粮①】、【急袭】、【奇策】、【慎断】的转化效果、【武圣】、【武圣（阵）】、【龙胆】
    "WHEN_SELECTING_CARD_AND_TARGET": "WHEN_SELECTING_CARD_AND_TARGET",

    //【集智】【雷击】
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
    //【杀】被抵消时能发动的技能/会执行的效果：
    // a.武将技能：【忠勇】、【虎啸】、【猛进】
    // b.装备技能：【贯石斧】、【青龙偃月刀】。
    "BEFORE_TAKE_EFFECT": "BEFORE_TAKE_EFFECT",

    // 若此牌未被抵消，确定将会生效。
    // 能发动的技能：【谦逊】。
    "WHEN_TAKE_EFFECT": "WHEN_TAKE_EFFECT",

    "AFTER_TAKE_EFFECT": "AFTER_TAKE_EFFECT",
}

const USE_EVENT_TIMINGS = [
    // USE_EVENT_TIMING.WHEN_SELECTING_CARD_AND_TARGET,
    // USE_EVENT_TIMING.WHEN_USING,
    // USE_EVENT_TIMING.WHEN_SPECIFYING_TARGET,
    USE_EVENT_TIMING.WHEN_BECOMING_TARGET, // 【流离】
    USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET, // 【铁骑】【烈弓】【青釭剑】【雌雄双股剑】
    // USE_EVENT_TIMING.AFTER_BECOMING_TARGET, // 【贞烈】

    USE_EVENT_TIMING.WHEN_SETTLEMENT_BEGINS,// 【仁王盾】【藤甲①】 如目标无效 本事件终止 如果此牌对目标有效，则继续对该目标进行结算。
    USE_EVENT_TIMING.BEFORE_TAKE_EFFECT, // 如被响应才会触发【贯石斧】、【青龙偃月刀】若没有触发【贯石斧】、【青龙偃月刀】生成伤害事件
    // USE_EVENT_TIMING.WHEN_TAKE_EFFECT,
    // USE_EVENT_TIMING.AFTER_TAKE_EFFECT, // 生成伤害和铁索连环事件 此事件进入弃牌堆
]

// https://gltjk.com/sanguosha/rules/flow/play.html
const PLAY_EVENT_TIMING = {
    // a.武将技能：【护驾】、【激将】 b.【八卦阵】。
    "WHEN_NEED_PLAY": "WHEN_NEED_PLAY",

    // a.武将技能：【涯角】、【龙胆②（阵）】、【雷击】。
    "WHEN_PLAYING": "WHEN_PLAYING",
}

const PLAY_EVENT_TIMINGS = [
    PLAY_EVENT_TIMING.WHEN_NEED_PLAY, // a.武将技能：【护驾】、【激将】 b.【八卦阵】。
    PLAY_EVENT_TIMING.WHEN_PLAYING,  // a.武将技能：【涯角】、【龙胆②（阵）】、【雷击】。
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

// https://gltjk.com/sanguosha/rules/flow/damage.html
const DAMAGE_EVENT_TIMING = {
    //【狂风】、【大雾】
    "WHEN_SETTLEMENT_BEGINS": "WHEN_SETTLEMENT_BEGINS",

    // a.武将技能：【裸衣】伤害值+1的效果 【雷击】回复1点体力的效果
    // b.装备技能：【麒麟弓】、【寒冰剑】、【古锭刀】
    "WHEN_CAUSE_DAMAGE": "WHEN_CAUSE_DAMAGE",

    // a.武将技能：【仁心】【无言②】、【天香】
    // b.装备技能：【藤甲②】、【白银狮子①】、【太平要术①】
    "WHEN_TAKE_DAMAGE": "WHEN_TAKE_DAMAGE",

    // 【奸雄】、【反馈】、【刚烈】、【遗计】、【节命】、【放逐】
    "AFTER_CAUSE_DAMAGE": "AFTER_CAUSE_DAMAGE",

    // a.能执行的技能效果：【天香】摸牌的效果。
    // b.若该角色是在处于连环状态时受到属性伤害，其须重置。
    "WHEN_SETTLEMENT_ENDS": "WHEN_SETTLEMENT_ENDS",
}

const DAMAGE_EVENT_TIMINGS = [
    // DAMAGE_EVENT_TIMING.WHEN_SETTLEMENT_BEGINS,
    DAMAGE_EVENT_TIMING.WHEN_CAUSE_DAMAGE,
    DAMAGE_EVENT_TIMING.WHEN_TAKE_DAMAGE,
    DAMAGE_EVENT_TIMING.AFTER_CAUSE_DAMAGE,
    // DAMAGE_EVENT_TIMING.WHEN_SETTLEMENT_ENDS,
]

// https://gltjk.com/sanguosha/rules/flow/game.html
const GAME_STAGE_TIMING = {
    // 翻面
    "GAME_STAGE_BEFORE_MY_TURN_START": "GAME_STAGE_BEFORE_MY_TURN_START",

    // 【当先】
    "GAME_STAGE_WHEN_MY_TURN_START": "GAME_STAGE_WHEN_MY_TURN_START",

    // 【洛神】【观星】
    "GAME_STAGE_WHEN_PREPARE": "GAME_STAGE_WHEN_PREPARE",

    // 【神速①】
    "GAME_STAGE_BETWEEN_PREPARE_AND_JUDGE": "GAME_STAGE_BETWEEN_PREPARE_AND_JUDGE",

    // 【勇略】
    "GAME_STAGE_WHEN_JUDGE_START": "GAME_STAGE_WHEN_JUDGE_START",

    // 判定
    "GAME_STAGE_IS_JUDGING": "GAME_STAGE_IS_JUDGING",

    //
    "GAME_STAGE_BETWEEN_JUDGE_AND_DRAW": "GAME_STAGE_BETWEEN_JUDGE_AND_DRAW",

    // 【突袭】【英姿】
    "GAME_STAGE_WHEN_DRAW_START": "GAME_STAGE_WHEN_DRAW_START",

    // 摸牌 【裸衣】
    "GAME_STAGE_IS_DRAWING": "GAME_STAGE_IS_DRAWING",

    // 【巧变】【放权】
    "GAME_STAGE_BETWEEN_DRAW_AND_PLAY": "GAME_STAGE_BETWEEN_DRAW_AND_PLAY",

    //
    "GAME_STAGE_WHEN_PLAY_START": "GAME_STAGE_WHEN_PLAY_START",

    // 出牌
    "GAME_STAGE_IS_PLAYING": "GAME_STAGE_IS_PLAYING",

    // 【克己】
    "GAME_STAGE_BETWEEN_PLAY_AND_THROW": "GAME_STAGE_BETWEEN_PLAY_AND_THROW",

    //
    "GAME_STAGE_WHEN_THROW_START": "GAME_STAGE_WHEN_THROW_START",

    // 弃牌
    "GAME_STAGE_IS_THROWING": "GAME_STAGE_IS_THROWING",

    // 闭月
    "GAME_STAGE_WHEN_END_START": "GAME_STAGE_WHEN_END_START",

}

const GAME_STAGE_TIMINGS = [
    // GAME_STAGE_TIMING.GAME_STAGE_BEFORE_MY_TURN_START,// 翻面
    // GAME_STAGE_TIMING.GAME_STAGE_WHEN_MY_TURN_START, // 【当先】
    GAME_STAGE_TIMING.GAME_STAGE_WHEN_PREPARE, // 【洛神】【观星】

    // GAME_STAGE_TIMING.GAME_STAGE_BETWEEN_PREPARE_AND_JUDGE,  // 【神速】

    // GAME_STAGE_TIMING.GAME_STAGE_WHEN_JUDGE_START, //
    GAME_STAGE_TIMING.GAME_STAGE_IS_JUDGING, // 判定

    // GAME_STAGE_TIMING.GAME_STAGE_BETWEEN_JUDGE_AND_DRAW,//

    GAME_STAGE_TIMING.GAME_STAGE_WHEN_DRAW_START, // 【突袭】【英姿】
    GAME_STAGE_TIMING.GAME_STAGE_IS_DRAWING,// 摸牌 【裸衣】

    // GAME_STAGE_TIMING.GAME_STAGE_BETWEEN_DRAW_AND_PLAY,  // 【巧变】【放权】

    // GAME_STAGE_TIMING.GAME_STAGE_WHEN_PLAY_START,//
    GAME_STAGE_TIMING.GAME_STAGE_IS_PLAYING, // 出牌

    GAME_STAGE_TIMING.GAME_STAGE_BETWEEN_PLAY_AND_THROW,// 【克己】

    // GAME_STAGE_TIMING.GAME_STAGE_WHEN_THROW_START,  //
    GAME_STAGE_TIMING.GAME_STAGE_IS_THROWING,// 弃牌

    GAME_STAGE_TIMING.GAME_STAGE_WHEN_END_START, // 闭月
]

// 不和timing一一对应
// 和gameStatus.events 对应
const ALL_EVENTS_KEY_CONFIG = {
    USE_STRIKE_EVENTS: "useStrikeEvents",
    RESPONSE_CARD_EVENTS: "responseCardEvents",
    DAMAGE_EVENTS: "damageEvents",

    PANDING_EVENT: "pandingEvent",

    GAME_STAGE_EVENT: "gameStageEvent"
}


exports.USE_EVENT_TIMING = USE_EVENT_TIMING;
exports.USE_EVENT_TIMINGS = USE_EVENT_TIMINGS;
exports.PLAY_EVENT_TIMING = PLAY_EVENT_TIMING;
exports.PLAY_EVENT_TIMINGS = PLAY_EVENT_TIMINGS;
exports.PANDING_EVENT_TIMING = PANDING_EVENT_TIMING;
exports.PANDING_EVENT_TIMINGS = PANDING_EVENT_TIMINGS;
exports.DAMAGE_EVENT_TIMING = DAMAGE_EVENT_TIMING;
exports.DAMAGE_EVENT_TIMINGS = DAMAGE_EVENT_TIMINGS;

exports.GAME_STAGE_TIMING = GAME_STAGE_TIMING;
exports.GAME_STAGE_TIMINGS = GAME_STAGE_TIMINGS;

exports.ALL_EVENTS_KEY_CONFIG = ALL_EVENTS_KEY_CONFIG;



