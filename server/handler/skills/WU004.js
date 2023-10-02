const {SKILL_CONFIG} = require("../../config/skillsConfig");
const {generateDamageEventThenSetNextDamageEventSkill} = require("../../event/damageEvent");
const handleWu004KuRouAction = (gameStatus) => {
    const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;

    generateDamageEventThenSetNextDamageEventSkill(gameStatus, {
        damageSkill: SKILL_CONFIG.WU004_KU_ROU.key, // 渠道
        originId,// 来源
        targetId: originId,
    })
}

exports.handleWu004KuRouAction = handleWu004KuRouAction;
