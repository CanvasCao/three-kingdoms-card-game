const strikeEvent = require("../event/strikeEvent");
const {handleHanBinJianResponse} = require("./skills/weapon");
const {handleQingLongYanYueDaoResponse} = require("./skills/weapon");
const {handleGuanShiFuResponse} = require("./skills/weapon");
const {handleQiLinGongResponse} = require("./skills/weapon");
const {USE_OR_PLAY_CONFIG} = require("../config/eventConfig");
const {ALL_SHA_CARD_KEYS} = require("../config/cardConfig");
const {generateResponseCardEventThenSetNextResponseCardEventSkill} = require("../event/responseCardEvent");
const {findOnGoingEvent} = require("../event/utils");
const {handleBaGuaZhenResponse} = require("./skills/shield");
const {handleCiXiongShuangGuJianResponse} = require("./skills/weapon");
const {CARD_CONFIG} = require("../config/cardConfig");
const {handleShu006TieJiResponse} = require("./skills/SHU006");
const {handleWu006LiuLiResponse} = require("./skills/WU006");
const {handleWei002GuiCaiResponse, handleWei002FanKuiResponse} = require("./skills/WEI002");
const {generateDamageEventThenSetNextDamageEventSkill} = require("../event/damageEvent");
const {SKILL_CONFIG} = require("../config/skillsConfig");
const {setStatusWhenPlayerDie} = require("../utils/dieUtils");
const {cloneDeep} = require("lodash");
const {
    setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect,
    resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie
} = require("../utils/wuxieUtils");
const {
    clearCardResponse,
    clearNextTaoResponse,
    clearNextScrollResponse,
} = require("../utils/responseUtils");
const {throwCards} = require("../utils/cardUtils")
const {getAllHasWuxiePlayers, getCurrentPlayer} = require("../utils/playerUtils")
const {emitNotifyJieDaoWeaponOwnerChange} = require("../utils/emitUtils")
const {ALL_EVENTS_KEY_CONFIG} = require("../config/eventConfig")

// export type EmitResponseData = {
//     chooseToResponse: boolean,
//     cards: Card[],
//     actualCard: Card,
//     originId: string,
//
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
    setStatusByCardResponse: (gameStatus, response) => {
        const cardResponse = gameStatus.cardResponse;
        const action = gameStatus.action;
        const responseOriginPlayer = gameStatus.players[cardResponse.originId];
        const responseTargetPlayer = gameStatus.players[cardResponse.targetId];
        responseOriginPlayer.removeCards(response.cards);
        throwCards(gameStatus, response.cards);

        const onGoingResponseCardEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.RESPONSE_CARD_EVENTS);
        if (response.chooseToResponse) {
            onGoingResponseCardEvent.responseStatus = true // 雷击

            if (ALL_SHA_CARD_KEYS.includes(cardResponse.actionCardKey)) {
                const onGoingUseStrikeEvent = findOnGoingEvent(gameStatus, ALL_EVENTS_KEY_CONFIG.USE_STRIKE_EVENTS);
                onGoingUseStrikeEvent.dodgeStatus = true; // 【贯石斧】、【青龙偃月刀】 猛进
            } else if (cardResponse.actionCardKey == CARD_CONFIG.JUE_DOU.key) { // 决斗出杀之后 需要互换目标
                generateResponseCardEventThenSetNextResponseCardEventSkill(gameStatus, {
                    originId: cardResponse.targetId,
                    targetId: cardResponse.originId,
                    actionCardKey: cardResponse.actionCardKey,
                    responseCardKeys: ALL_SHA_CARD_KEYS,
                    useOrPlay: USE_OR_PLAY_CONFIG.PLAY
                })
            }
        } else {
            if (ALL_SHA_CARD_KEYS.includes(cardResponse.actionCardKey)) {
                delete gameStatus.useStrikeEvents;
            }
            generateDamageEventThenSetNextDamageEventSkill(gameStatus, {
                damageCards: action.cards,
                damageActualCard: action.actualCard, // 渠道
                damageAttribute: action.actualCard?.attribute,// 属性
                originId: cardResponse.targetId,// 来源
                targetId: cardResponse.originId
            })
            delete gameStatus.responseCardEvents;// 吕布无双的情况下删除所有的responseCardEvents
        }
        clearCardResponse(gameStatus);
    },

    setStatusBySkillResponse: (gameStatus, response) => {
        const skillNameKey = gameStatus.skillResponse.skillNameKey;
        const chooseToReleaseSkill = response.chooseToResponse;
        gameStatus.skillResponse.chooseToReleaseSkill = chooseToReleaseSkill;
        if (!chooseToReleaseSkill) {
            delete gameStatus.skillResponse
        }

        if (skillNameKey == SKILL_CONFIG.SHU006_TIE_JI.key) {
            handleShu006TieJiResponse(gameStatus, response)
        } else if (skillNameKey == SKILL_CONFIG.WEI002_FAN_KUI.key) {
            handleWei002FanKuiResponse(gameStatus, response)
        } else if (skillNameKey == SKILL_CONFIG.WEI002_GUI_CAI.key) {
            handleWei002GuiCaiResponse(gameStatus, response)
        } else if (skillNameKey == SKILL_CONFIG.WU006_LIU_LI.key) {
            handleWu006LiuLiResponse(gameStatus, response)
        } else if (skillNameKey == CARD_CONFIG.CI_XIONG_SHUANG_GU_JIAN.key) {
            handleCiXiongShuangGuJianResponse(gameStatus, response)
        } else if (skillNameKey == CARD_CONFIG.QI_LIN_GONG.key) {
            handleQiLinGongResponse(gameStatus, response)
        } else if (skillNameKey == CARD_CONFIG.BA_GUA_ZHEN.key) {
            handleBaGuaZhenResponse(gameStatus, response)
        } else if (skillNameKey == CARD_CONFIG.GUAN_SHI_FU.key) {
            handleGuanShiFuResponse(gameStatus, response)
        } else if (skillNameKey == CARD_CONFIG.QING_LONG_YAN_YUE_DAO.key) {
            handleQingLongYanYueDaoResponse(gameStatus, response)
        } else if (skillNameKey == CARD_CONFIG.HAN_BIN_JIAN.key) {
            handleHanBinJianResponse(gameStatus, response)
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

    setStatusByJieDaoResponse: (gameStatus, response) => {
        if (response.chooseToResponse) { // 出杀 A=>B A出杀 B响应闪
            const curScrollResponse = gameStatus.scrollResponses[0];
            const APlayer = gameStatus.players[curScrollResponse.originId]
            const BPlayer = gameStatus.players[curScrollResponse.targetId]
            gameStatus.players[APlayer.playerId].removeCards(response.cards);

            strikeEvent.generateUseStrikeEventsThenSetNextStrikeEventSkill(gameStatus,
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

    // // 武器
    // setStatusByQingLongYanYueDaoResponse: (gameStatus, response) => {
    //     if (response.chooseToResponse) {
    //         const action = gameStatus.action;
    //         clearNextWeaponResponse(gameStatus);
    //         gameStatus.cardResponse = {
    //             originId: action.targetIds[0],
    //             targetId: action.originId,
    //             cardNumber: 1,
    //         }
    //     } else {
    //         clearNextWeaponResponse(gameStatus);
    //         clearCardResponse(gameStatus)
    //     }
    // }
}

exports.responseCardHandler = responseCardHandler;