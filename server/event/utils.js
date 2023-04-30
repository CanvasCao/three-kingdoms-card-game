const {CARD_CONFIG} = require("../config/cardConfig");
const {USE_EVENT_TIMING} = require("../config/eventConfig");
const {getAllPlayersStartFromFirstLocation} = require("../utils/playerUtils");
const {SKILLS} = require("../config/skillsConfig");
const {PANDING_EVENT_TIMING} = require("../config/eventConfig");

const configSkillToEventSkill = (configSkill, playerId) => {
    return {
        skillName: configSkill.name,
        playerId,
        chooseToRelease: undefined,
    }
}

const findAllEventSkillsByTimingName = (gameStatus, {name, originId, targetId}) => {
    /*
        skillName,
        playerId,
        chooseToRelease: undefined,
    */
    const originPlayer = gameStatus.players[originId];
    const originHeroId = originPlayer.heroId;
    const originPlayerId = originPlayer.playerId;
    const targetPlayer = gameStatus.players?.[targetId];
    const targetHeroId = targetPlayer?.heroId;
    const targetPlayerId = targetPlayer?.playerId;

    let eventSkills = [];

    // 判定 相关技能
    if (name == PANDING_EVENT_TIMING.BEFORE_PANDING_TAKE_EFFECT) {
        const allPlayers = getAllPlayersStartFromFirstLocation(gameStatus, gameStatus.players[originId].location)
        allPlayers.forEach((p) => {
            const eventSkillsForPlayer = SKILLS[p.heroId]
                .filter((skill) => skill.triggerTiming == name)
                .map((skill) => configSkillToEventSkill(skill, p.playerId))
            eventSkills = eventSkills.concat(eventSkillsForPlayer)
        })
    } else if (name == PANDING_EVENT_TIMING.AFTER_PANDING_TAKE_EFFECT) {
        const eventSkillsForPlayer = SKILLS[originHeroId]
            .filter((skill) => skill.triggerTiming == name)
            .map((skill) => configSkillToEventSkill(skill, originPlayer.playerId))
        eventSkills = eventSkills.concat(eventSkillsForPlayer)
    }

    // 杀 相关技能
    else if (name == USE_EVENT_TIMING.WHEN_BECOMING_TARGET) {
        console.log("targetHeroId",targetHeroId)
        const eventSkillsForPlayer = SKILLS[targetHeroId]
            .filter((skill) => skill.triggerTiming == name && skill.triggerCard == CARD_CONFIG.SHA.CN)
            .map((skill) => configSkillToEventSkill(skill, targetPlayerId))
        eventSkills = eventSkills.concat(eventSkillsForPlayer)
    } else if (name == USE_EVENT_TIMING.AFTER_SPECIFYING_TARGET) {
        const eventSkillsForPlayer = SKILLS[originHeroId]
            .filter((skill) => skill.triggerTiming == name && skill.triggerCard == CARD_CONFIG.SHA.CN)
            .map((skill) => configSkillToEventSkill(skill, originPlayerId))
        eventSkills = eventSkills.concat(eventSkillsForPlayer)
    }
    return eventSkills;
}

exports.configSkillToEventSkill = configSkillToEventSkill;
exports.findAllEventSkillsByTimingName = findAllEventSkillsByTimingName;