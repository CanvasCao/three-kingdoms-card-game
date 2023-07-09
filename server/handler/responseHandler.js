const strikeEvent = require("../event/strikeEvent");
const pandingEvent = require("../event/pandingEvent");
const {findOnGoingDamageEventSkill} = require("../event/utils");
const {generateDamageEventThenSetNextDamageEventSkillToSkillResponse} = require("../event/damageEvent");
const {findOnGoingUseStrikeEvent} = require("../event/utils");
const {SKILL_NAMES} = require("../config/skillsConfig");
const {findOnGoingPandingEvent} = require("../event/utils");
const {findOnGoingPandingEventSkill} = require("../event/utils");
const {findOnGoingUseStrikeEventSkill} = require("../event/utils");
const {setStatusWhenPlayerDie} = require("../utils/dieUtils");
const {cloneDeep} = require("lodash");
const {
    setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect,
    resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie
} = require("../utils/wuxieUtils");
const {
    clearShanResponse,
    clearNextTaoResponse,
    clearNextScrollResponse,
    clearNextWeaponResponse
} = require("../utils/clearResponseUtils");
const {throwCards} = require("../utils/cardUtils")
const {getAllHasWuxiePlayers, getCurrentPlayer} = require("../utils/playerUtils")
const {emitNotifyJieDaoWeaponOwnerChange} = require("../utils/emitUtils")

// export type EmitResponseData = {
//     chooseToResponse: boolean,
//     cards: Card[],
//     actualCard: Card,
//     originId: string,
//
//     selectedIndexes: number[],
//
//     // 基本卡
//     targetId?: string,
//
//     // 为了校验无懈可击是否冲突
//     wuxieTargetCardId?: string,
//
//     // 响应技能选中的目标 流离
//     skillTargetIds?: string[]
// }

const responseCardHandler = {
    setStatusByShanResponse: (gameStatus, response) => {
        const shanResponse = gameStatus.shanResponse;
        const action = gameStatus.action;
        const responseOriginPlayer = gameStatus.players[shanResponse.originId];
        const responseTargetPlayer = gameStatus.players[shanResponse.targetId];
        responseOriginPlayer.removeCards(response.cards);
        throwCards(gameStatus, response.cards);

        if (response.chooseToResponse) { // 出闪了
            shanResponse.cardNumber--; // 吕布需要两个杀
            if (shanResponse.cardNumber == 0) {
                clearShanResponse(gameStatus);

                // if (targetPlayer?.weaponCard?.CN == EQUIPMENT_CARDS_CONFIG.QING_LONG_YAN_YUE_DAO.CN) {
                //     gameStatus.weaponResponses = [
                //         {
                //             originId: shanResponse.targetId,
                //             targetId: shanResponse.originId,
                //             weaponCardName: CARD_CONFIG.QING_LONG_YAN_YUE_DAO.CN,
                //         }
                //     ];
                // }
            } else {
                // do nothing
            }
        } else { // 没出闪
            clearShanResponse(gameStatus);
            generateDamageEventThenSetNextDamageEventSkillToSkillResponse(gameStatus, {
                damageCards: action.cards,
                damageActualCard: action.actualCard, // 渠道
                damageAttribute: action.actualCard?.attribute,// 属性
                originId: shanResponse.targetId,// 来源
                targetId: shanResponse.originId
            })
        }
    },

    setStatusBySkillResponse: (gameStatus, response) => {
        const skillResponse = gameStatus.skillResponse;
        const skillName = gameStatus.skillResponse.skillName;
        const originPlayer = gameStatus.players[response.originId];

        const chooseToReleaseSkill = response.chooseToResponse;
        gameStatus.skillResponse.chooseToReleaseSkill = chooseToReleaseSkill;

        if (skillName == SKILL_NAMES.SHU["006"].TIE_JI) {
            const onGoingUseStrikeEventSkill = findOnGoingUseStrikeEventSkill(gameStatus);
            onGoingUseStrikeEventSkill.done = true;
            delete gameStatus.skillResponse
            if (chooseToReleaseSkill) {
                pandingEvent.generatePandingEventThenSetNextPandingEventSkillToSkillResponse(gameStatus, skillResponse.playerId, skillName);
            }
        } else if (skillName == SKILL_NAMES.WEI["002"].FAN_KUI) {
            const onGoingDamageEventSkill = findOnGoingDamageEventSkill(gameStatus);

            if (!chooseToReleaseSkill) {
                onGoingDamageEventSkill.done = true;
                delete gameStatus.skillResponse
                return
            }

            if (onGoingDamageEventSkill.chooseToReleaseSkill === undefined) {
                onGoingDamageEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
            } else {
                // 在CardBoard
                // onGoingDamageEventSkill.done = true;
                // 不能删除 gameStatus.skillResponse
            }
        } else if (skillName == SKILL_NAMES.WEI["002"].GUI_CAI) {
            const onGoingPandingEventSkill = findOnGoingPandingEventSkill(gameStatus);
            const onGoingPandingEvent = findOnGoingPandingEvent(gameStatus)

            if (!chooseToReleaseSkill) {
                onGoingPandingEventSkill.done = true;
                delete gameStatus.skillResponse
                return
            }
            if (onGoingPandingEventSkill.chooseToReleaseSkill === undefined) {
                onGoingPandingEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
            } else {
                onGoingPandingEvent.pandingResultCard = response.cards[0]
                onGoingPandingEventSkill.releaseCards = response.cards // 最后结算弃牌的时候需要 每次弃每次改判的牌
                onGoingPandingEventSkill.done = true;
                delete gameStatus.skillResponse
                originPlayer.removeCards(response.cards);
            }
        } else if (skillName == SKILL_NAMES.WU["006"].LIU_LI) {
            const onGoingUseStrikeEvent = findOnGoingUseStrikeEvent(gameStatus);
            const onGoingUseStrikeEventSkill = findOnGoingUseStrikeEventSkill(gameStatus);

            if (!chooseToReleaseSkill) {
                onGoingUseStrikeEventSkill.done = true;
                delete gameStatus.skillResponse
                return
            }

            if (onGoingUseStrikeEventSkill.chooseToReleaseSkill === undefined) {
                onGoingUseStrikeEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
            } else {
                onGoingUseStrikeEventSkill.releaseTargetIds = response.skillTargetIds
                onGoingUseStrikeEventSkill.releaseCards = response.cards // 最后结算弃牌的时候需要
                onGoingUseStrikeEventSkill.done = true;

                onGoingUseStrikeEvent.targetId = response.skillTargetIds[0];

                delete gameStatus.skillResponse
                originPlayer.removeCards(response.cards);
            }
        }
    },

    setStatusByTaoResponse: (gameStatus, response) => {
        const curTaoResponse = gameStatus.taoResponses[0];
        const originPlayer = gameStatus.players[curTaoResponse.originId];
        const targetPlayer = gameStatus.players[curTaoResponse.targetId];
        originPlayer.removeCards(response.cards);
        throwCards(gameStatus, response.cards);

        if (response.chooseToResponse) { // 出桃了
            targetPlayer.addBlood();
            if (targetPlayer.currentBlood > 0) { // 出桃复活 不需要任何人再出桃
                gameStatus.taoResponses = [];
            } else { // 出桃还没复活 更新需要下一个人提示的出桃的数量
                gameStatus.taoResponses.forEach((rs) => {
                    rs.cardNumber = 1 - targetPlayer.currentBlood;
                })
            }
        } else {
            // 没出桃 下一个人求桃
            clearNextTaoResponse(gameStatus);

            // 没有任何人出桃 当前角色死亡
            if (gameStatus.taoResponses.length == 0) {
                setStatusWhenPlayerDie(gameStatus, targetPlayer);
            }
        }
    },

    setStatusByWuxieResponse: (gameStatus, response) => {
        let hasWuxiePlayerIds = gameStatus.wuxieSimultaneousResponse.hasWuxiePlayerIds;
        let wuxieChain = gameStatus.wuxieSimultaneousResponse.wuxieChain;
        const originPlayer = gameStatus.players[response.originId];

        // EmitResponseData = {
        //     cards: Card[],
        //     actualCard: Card,
        //     originId: string,
        //     wuxieTargetCardId?: string,
        // }

        // 锦囊
        // 出无懈可击了
        // 1 校验chain 如果已通过 用户打出 更新hasWuxiePlayerIds/wuxieChain
        // 1.1 如果没人有无懈 清空wuxieResponse 锦囊生效
        // 1.2 如果还有人有无懈 前端强制等待三秒
        // 2 如果校验response.wuxieTargetCardId不通过 后端不会removeHandCards

        // 不出无懈可击
        // 从hasWuxiePlayerIds移除
        // 如果 如果没人有无懈 清空wuxieResponse 锦囊生效
        // 否则 如果还有人有无懈 继续等待

        if (response.chooseToResponse) { // 出无懈可击了
            const lastWuxieChainItem = wuxieChain[wuxieChain.length - 1];
            const validatedChainResponse = lastWuxieChainItem.actualCard.cardId === response.wuxieTargetCardId;

            if (validatedChainResponse) {
                originPlayer.removeCards(response.cards);
                resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie(gameStatus, response);
                const newHasWuxiePlayers = getAllHasWuxiePlayers(gameStatus);
                if (newHasWuxiePlayers.length == 0) {
                    // 锦囊开始结算
                    setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, "setStatusByWuxieResponse 出了无懈可击");
                } else {
                    // 前端强制等待三秒
                }
            }
        } else { // 没出无懈可击
            const newHasWuxiePlayersIds = hasWuxiePlayerIds.filter((id) => id !== response.originId);
            gameStatus.wuxieSimultaneousResponse.hasWuxiePlayerIds = newHasWuxiePlayersIds;
            if (newHasWuxiePlayersIds.length == 0) {
                // 锦囊开始结算
                setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, "setStatusByWuxieResponse 没出无懈可击")
            }
        }
    },

    setStatusByNanManOrWanJianResponse: (gameStatus, response) => {
        const action = gameStatus.action;
        const originId = response.originId;
        const originPlayer = gameStatus.players[originId];
        const curScrollResponse = gameStatus.scrollResponses[0];

        if (response.chooseToResponse) {
            clearNextScrollResponse(gameStatus);
            originPlayer.removeCards(response.cards);
        } else {
            clearNextScrollResponse(gameStatus);
            generateDamageEventThenSetNextDamageEventSkillToSkillResponse(gameStatus, {
                damageCards: action.cards,
                damageActualCard: action.actualCard, // 渠道
                damageAttribute: undefined,// 属性
                originId: curScrollResponse.targetId,// 来源
                targetId: curScrollResponse.originId
            })
        }
    },

    setStatusByJueDouResponse: (gameStatus, response) => {
        const action = gameStatus.action;
        const curScrollResponse = gameStatus.scrollResponses[0];

        if (response.chooseToResponse) {
            gameStatus.players[curScrollResponse.originId].removeCards(response.cards);

            // 决斗出杀之后 需要互换目标
            const oriTargetId = curScrollResponse.targetId;
            const oriOriginId = curScrollResponse.originId;
            curScrollResponse.targetId = oriOriginId;
            curScrollResponse.originId = oriTargetId;
        } else {
            clearNextScrollResponse(gameStatus);
            generateDamageEventThenSetNextDamageEventSkillToSkillResponse(gameStatus, {
                damageCards: action.cards,
                damageActualCard: action.actualCard, // 渠道
                damageAttribute: undefined,// 属性
                originId: curScrollResponse.targetId,// 来源
                targetId: curScrollResponse.originId
            })
        }
    },

    setStatusByJieDaoResponse: (gameStatus, response) => {
        if (response.chooseToResponse) { // 出杀 A=>B A出杀 B响应闪
            const curScrollResponse = gameStatus.scrollResponses[0];
            const APlayer = gameStatus.players[curScrollResponse.originId]
            const BPlayer = gameStatus.players[curScrollResponse.targetId]
            gameStatus.players[APlayer.playerId].removeCards(response.cards);

            strikeEvent.generateUseStrikeEventsThenSetNextStrikeEventSkillToSkillResponse(gameStatus,
                {
                    originId: APlayer.playerId,
                    targetIds: [BPlayer.playerId],
                    cards: response.cards || [],
                    actualCard: response.actualCard
                });
        } else {
            // TODO 如果没有杀 自动不出
            // 不出杀 A=>B A不出 A把刀给当前用户
            const curScrollResponse = gameStatus.scrollResponses[0];
            const APlayer = gameStatus.players[curScrollResponse.originId]
            const currentPlayer = getCurrentPlayer(gameStatus);

            const weaponCard = cloneDeep(APlayer.weaponCard);
            APlayer.removeCards(weaponCard)
            currentPlayer.addCards(weaponCard)
            emitNotifyJieDaoWeaponOwnerChange(gameStatus, weaponCard);
        }

        clearNextScrollResponse(gameStatus);
    },

    // 武器
    setStatusByQingLongYanYueDaoResponse: (gameStatus, response) => {
        if (response.chooseToResponse) {
            const action = gameStatus.action;
            clearNextWeaponResponse(gameStatus);
            gameStatus.shanResponse = {
                originId: action.targetIds[0],
                targetId: action.originId,
                cardNumber: 1,
            }
        } else {
            clearNextWeaponResponse(gameStatus);
            clearShanResponse(gameStatus)
        }
    }
}

exports.responseCardHandler = responseCardHandler;