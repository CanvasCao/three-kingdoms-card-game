const strikeEvent = require("../event/strikeEvent");
const pandingEvent = require("../event/pandingEvent");
const {SKILL_NAMES} = require("../config/skillsConfig");
const {findOnGoingPandingEvent} = require("../event/utils");
const {setNextPandingEventSkillToSkillResponse} = require("../event/pandingEvent");
const {findOnGoingPandingEventSkill} = require("../event/utils");
const {setNextStrikeEventSkillToSkillResponse} = require("../event/strikeEvent");
const {findOnGoingUseStrikeEventSkill} = require("../event/utils");
const {generateWuxieSimultaneousResStageByScroll} = require("../utils/wuxieUtils");
const {CARD_CONFIG, EQUIPMENT_CARDS_CONFIG} = require("../config/cardConfig");
const {setStatusWhenPlayerDie} = require("../utils/dieUtils");
const {cloneDeep} = require("lodash");
const {
    setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect,
    resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie
} = require("../utils/wuxieUtils");
const {
    generateTieSuoTempStorageByShaAction,
    setGameStatusByTieSuoTempStorage
} = require("../utils/tieSuoUtils");
const {
    clearShanResponse,
    clearNextTaoStage,
    clearNextScrollStage,
    clearNextWeaponStage
} = require("../utils/clearResStageUtils");
const {throwCards} = require("../utils/cardUtils")
const {getAllHasWuxiePlayers, getCurrentPlayer} = require("../utils/playerUtils")
const {emitNotifyJieDaoWeaponOwnerChange} = require("../utils/emitUtils")

const responseCardHandler = {
    setStatusByShanResponse: (gameStatus, response) => {
        const shanResponse = gameStatus.shanResponse;
        const originPlayer = gameStatus.players[shanResponse.originId];
        const targetPlayer = gameStatus.players[shanResponse.targetId];
        originPlayer.removeHandCards(response.cards);
        throwCards(gameStatus, response.cards);

        if (response.chooseToResponse) { // 出闪了
            shanResponse.cardNumber--; // 吕布需要两个杀
            if (shanResponse.cardNumber == 0) {
                clearShanResponse(gameStatus);

                if (targetPlayer?.weaponCard?.CN == EQUIPMENT_CARDS_CONFIG.QING_LONG_YAN_YUE_DAO.CN) {
                    gameStatus.weaponResStages = [
                        {
                            originId: shanResponse.targetId,
                            targetId: shanResponse.originId,
                            weaponCardName: CARD_CONFIG.QING_LONG_YAN_YUE_DAO.CN,
                        }
                    ];
                }
            } else {
                // do nothing
            }
        } else { // 没出闪
            clearShanResponse(gameStatus);
            originPlayer.reduceBlood();
            generateTieSuoTempStorageByShaAction(gameStatus);

            // <0 setGameStatusByTieSuoTempStorage的逻辑在求桃之后
            // 如果我还活着需要立刻结算下一个人的铁锁连环
            if (originPlayer.currentBlood > 0) {
                setGameStatusByTieSuoTempStorage(gameStatus);
            }
        }
    },

    // Response
    // {
    //     chooseToResponse: boolean,
    //     cards: Card[],
    //     actualCard: Card,
    //     originId: string,
    //     targetId?: string,
    //
    //     // 为了校验无懈可击是否冲突
    //     wuxieTargetCardId?: string,
    //
    //     selectedIndexes: number[],
    // }
    setStatusBySkillResponse: (gameStatus, response) => {
        const skillResponse = gameStatus.skillResponse;
        const skillName = gameStatus.skillResponse.skillName;
        const chooseToReleaseSkill = response.chooseToResponse;
        const originPlayer = gameStatus.players[response.originId];

        if (skillName == SKILL_NAMES.SHU["006"].TIE_JI) {
            const onGoingUseStrikeEventSkill = findOnGoingUseStrikeEventSkill(gameStatus);
            onGoingUseStrikeEventSkill.done = true;
            delete gameStatus.skillResponse
            if (chooseToReleaseSkill) {
                pandingEvent.generatePandingEventThenSetNextPandingEventSkillToSkillResponse(gameStatus, skillResponse.playerId, skillName);
                if (!gameStatus.skillResponse) {
                    setNextStrikeEventSkillToSkillResponse(gameStatus)
                }
            } else {
                setNextStrikeEventSkillToSkillResponse(gameStatus)
            }
        } else if (skillName == SKILL_NAMES.WEI["002"].GUI_CAI) {
            const onGoingPandingEventSkill = findOnGoingPandingEventSkill(gameStatus);
            const onGoingPandingEvent = findOnGoingPandingEvent(gameStatus)

            if (!chooseToReleaseSkill) {
                onGoingPandingEventSkill.done = true;
                delete gameStatus.skillResponse

                setNextPandingEventSkillToSkillResponse(gameStatus)
                return
            }

            if (onGoingPandingEventSkill.chooseToReleaseSkill === undefined) {
                onGoingPandingEventSkill.chooseToReleaseSkill = chooseToReleaseSkill
            } else {
                onGoingPandingEvent.pandingResultCard = response.cards[0]
                onGoingPandingEventSkill.releaseCards = response.cards // 最后结算弃牌的时候需要 每次弃每次改判的牌
                onGoingPandingEventSkill.done = true;
                delete gameStatus.skillResponse
                originPlayer.removeHandCards(response.cards);

                setNextPandingEventSkillToSkillResponse(gameStatus)
            }
        }
    },

    setStatusByTaoResponse: (gameStatus, response) => {
        const curTaoResStage = gameStatus.taoResStages[0];
        const originPlayer = gameStatus.players[curTaoResStage.originId];
        const targetPlayer = gameStatus.players[curTaoResStage.targetId];
        originPlayer.removeHandCards(response.cards);
        throwCards(gameStatus, response.cards);

        if (response.chooseToResponse) { // 出桃了
            targetPlayer.addBlood();

            if (targetPlayer.currentBlood > 0) { // 出桃复活 不需要任何人再出桃
                gameStatus.taoResStages = [];
                setGameStatusByTieSuoTempStorage(gameStatus);
            } else { // 出桃还没复活 更新需要下一个人提示的出桃的数量
                gameStatus.taoResStages.forEach((rs) => {
                    rs.cardNumber = 1 - targetPlayer.currentBlood;
                })
            }
        } else {
            // 没出桃 下一个人求桃
            clearNextTaoStage(gameStatus);

            // 没有任何人出桃 当前角色死亡
            if (gameStatus.taoResStages.length == 0) {
                setStatusWhenPlayerDie(gameStatus, targetPlayer);
                setGameStatusByTieSuoTempStorage(gameStatus);
            }
        }
    },


    setStatusByWuxieResponse: (gameStatus, response) => {
        let hasWuxiePlayerIds = gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds;
        let wuxieChain = gameStatus.wuxieSimultaneousResStage.wuxieChain;
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
        // 1.1 如果没人有无懈 清空wuxieResStage 锦囊生效
        // 1.2 如果还有人有无懈 前端强制等待三秒
        // 2 如果校验response.wuxieTargetCardId不通过 后端不会removeHandCards

        // 不出无懈可击
        // 从hasWuxiePlayerIds移除
        // 如果 如果没人有无懈 清空wuxieResStage 锦囊生效
        // 否则 如果还有人有无懈 继续等待

        if (response.chooseToResponse) { // 出无懈可击了
            const lastWuxieChainItem = wuxieChain[wuxieChain.length - 1];
            const validatedChainResponse = lastWuxieChainItem.actualCard.cardId === response.wuxieTargetCardId;

            if (validatedChainResponse) {
                originPlayer.removeHandCards(response.cards);
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
            gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds = newHasWuxiePlayersIds;
            if (newHasWuxiePlayersIds.length == 0) {
                // 锦囊开始结算
                setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, "setStatusByWuxieResponse 没出无懈可击")
            }
        }
    },

    setStatusByNanManOrWanJianResponse: (gameStatus, response) => {
        const originPlayer = gameStatus.players[response.originId];

        if (response.chooseToResponse) {
            clearNextScrollStage(gameStatus);
            originPlayer.removeHandCards(response.cards);
        } else {
            clearNextScrollStage(gameStatus);
            originPlayer.reduceBlood();
        }

        if (gameStatus.scrollResStages.length > 0) {
            const newHasWuxiePlayers = getAllHasWuxiePlayers(gameStatus);
            if (newHasWuxiePlayers.length == 0) {
                setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, "setStatusByNanManResponse");
            } else {
                generateWuxieSimultaneousResStageByScroll(gameStatus)
            }
        }
    },

    setStatusByJueDouResponse: (gameStatus, response) => {
        if (response.chooseToResponse) {
            const curScrollResStage = gameStatus.scrollResStages[0];
            gameStatus.players[curScrollResStage.originId].removeHandCards(response.cards);

            // 决斗出杀之后 需要互换目标
            const oriTargetId = curScrollResStage.targetId;
            const oriOriginId = curScrollResStage.originId;
            curScrollResStage.targetId = oriOriginId;
            curScrollResStage.originId = oriTargetId;
        } else {
            const curScrollResStage = gameStatus.scrollResStages[0];
            gameStatus.players[curScrollResStage.originId].reduceBlood();

            clearNextScrollStage(gameStatus);
        }
    },

    setStatusByJieDaoResponse: (gameStatus, response) => {
        if (response.chooseToResponse) { // 出杀 A=>B A出杀 B响应闪
            const curScrollResStage = gameStatus.scrollResStages[0];
            const APlayer = gameStatus.players[curScrollResStage.originId]
            const BPlayer = gameStatus.players[curScrollResStage.targetId]
            gameStatus.players[APlayer.playerId].removeHandCards(response.cards);
            strikeEvent.generateUseStrikeEventsThenSetNextStrikeEventSkillToSkillResponse(gameStatus, APlayer.playerId, [BPlayer.playerId]);
        } else {
            // TODO 如果没有杀 自动不出
            // 不出杀 A=>B A不出 A把刀给当前用户
            const curScrollResStage = gameStatus.scrollResStages[0];
            const APlayer = gameStatus.players[curScrollResStage.originId]
            const currentPlayer = getCurrentPlayer(gameStatus);

            const weaponCard = cloneDeep(APlayer.weaponCard);
            APlayer.removeCards(weaponCard)
            currentPlayer.addCards(weaponCard)
            emitNotifyJieDaoWeaponOwnerChange(gameStatus.io, gameStatus.action, weaponCard);
        }
        clearNextScrollStage(gameStatus);
    },

    // 武器
    setStatusByQingLongYanYueDaoResponse: (gameStatus, response) => {
        if (response.chooseToResponse) {
            const action = gameStatus.action;
            clearNextWeaponStage(gameStatus);
            gameStatus.shanResponse = {
                originId: action.targetIds[0],
                targetId: action.originId,
                cardNumber: 1,
            }
        } else {
            clearNextWeaponStage(gameStatus);
            clearShanResponse(gameStatus)
        }
    }
}

exports.responseCardHandler = responseCardHandler;