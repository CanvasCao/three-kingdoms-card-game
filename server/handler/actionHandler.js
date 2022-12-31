const {EQUIPMENT_TYPE, SCROLL_CARDS_CONFIG} = require("../initCards")
const {getAllHasWuxiePlayers, getCurrentPlayer} = require("../utils/playerUtils");
const {
    generateWuxieSimultaneousResStageByScroll,
    setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect
} = require("../utils/wuxieUtils");
const {v4: uuidv4} = require('uuid');

const actionHandler = {
    // BASIC
    setStatusByShaAction: (gameStatus) => {
        const action = gameStatus.action;

        gameStatus.shanResStages = action.targetIds.map((targetId) => {
            return {
                originId: targetId,
                targetId: action.originId,
                cardNumber: 1,
            }
        })
    },
    setStatusByTaoAction: (gameStatus) => {
        const action = gameStatus.action;
        const originPlayer = gameStatus.players[action.originId]
        if (originPlayer.currentBlood < originPlayer.maxBlood) {
            originPlayer.addBlood();
        }
    },

    // SCROLL
    setStatusByWuZhongShengYouAction(gameStatus) {
        actionHandler.setStatusByScrollAction(gameStatus);
    },
    setStatusByGuoHeChaiQiaoAction(gameStatus) {
        actionHandler.setStatusByScrollAction(gameStatus);
    },
    setStatusByShunShouQianYangAction(gameStatus) {
        actionHandler.setStatusByScrollAction(gameStatus);
    },
    setStatusByTaoYuanJieYiAction(gameStatus) {
        actionHandler.setStatusByScrollAction(gameStatus);
    },
    setStatusByNanManRuQinAction(gameStatus) {
        actionHandler.setStatusByScrollAction(gameStatus);
    },
    setStatusByWanJianQiFaAction(gameStatus) {
        actionHandler.setStatusByScrollAction(gameStatus);
    },
    setStatusByJueDouAction(gameStatus) {
        actionHandler.setStatusByScrollAction(gameStatus);
    },
    setStatusByJieDaoShaRenAction(gameStatus) {
        // action={
        //     origin:C,
        //     targetIds:[A,B],
        //     isEffect:false,
        // }
        // scrollResStages=[{
        //     originId: A,
        //     targetId: B,
        //     isEffect:false,
        // }]

        // 1.失效
        // scrollResStages=[]
        //
        // 2.生效
        // scrollResStages=[{
        //     originId: A,
        //     targetId: B,
        //     isEffect:true,
        // }]
        //
        // 2.1 出杀
        // scrollResStages=[]
        // shanResStages = [{
        //     originId: B,
        //     targetId: A,
        //     cardNumber: 1,
        // }]
        //
        // 2.2 不出杀
        // scrollResStages=[]
        // A remove weapon
        // CurrentPlayer add weapon

        actionHandler.setStatusByScrollAction(gameStatus);
    },
    setStatusByScrollAction(gameStatus) {
        const action = gameStatus.action;

        // TODO hardcode 只有顺和拆 桃园 originId targetId的值和action一样
        if (action.targetIds) {
            if (action.actualCard.CN == SCROLL_CARDS_CONFIG.SHUN_SHOU_QIAN_YANG.CN ||
                action.actualCard.CN == SCROLL_CARDS_CONFIG.GUO_HE_CHAI_QIAO.CN) {
                gameStatus.scrollResStages = action.targetIds.map((targetId) => {
                    return {
                        originId: action.originId,
                        targetId: targetId,
                        cards: action.cards,
                        actualCard: action.actualCard,
                        isEffect: false,
                        stageId: uuidv4(), // 前端刷新Board的依据
                    }
                })
            } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.JIE_DAO_SHA_REN.CN) {
                gameStatus.scrollResStages = [{
                    originId: action.targetIds[0],
                    targetId: action.targetIds[1],
                    cards: action.cards,
                    actualCard: action.actualCard,
                    isEffect: false,
                }]
            }
        } else if (action.targetId) {
            if (action.actualCard.CN == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.CN) {
                gameStatus.scrollResStages = [{
                    originId: action.originId,
                    targetId: action.targetId,
                    cards: action.cards,
                    actualCard: action.actualCard,
                    isEffect: false,
                }]
            } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.JUE_DOU.CN) { // 决斗originId targetId的值相反
                gameStatus.scrollResStages = [{
                    originId: action.targetId,
                    targetId: action.originId,
                    cards: action.cards,
                    actualCard: action.actualCard,
                    isEffect: false,
                }]
            }
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.CN) {
            // TODO 桃园结义
            const targetIds = Object.values(gameStatus.players).filter((u) => u.currentBlood < u.maxBlood).map((u) => u.playerId);
            if (targetIds.length) {
                gameStatus.scrollResStages = targetIds.map((targetId) => {
                    return {
                        originId: action.originId,
                        targetId: targetId,
                        cards: action.cards,
                        actualCard: action.actualCard,
                        isEffect: false,
                    }
                })
            } else {
                return // 都满血直接return
            }
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.NAN_MAN_RU_QIN.CN ||
            action.actualCard.CN == SCROLL_CARDS_CONFIG.WAN_JIAN_QI_FA.CN) {
            const currentPlayer = getCurrentPlayer(gameStatus);
            const firstLocation = getCurrentPlayer(gameStatus).location;
            const scrollResStages = []
            for (let i = firstLocation; i < firstLocation + Object.keys(gameStatus.players).length; i++) {
                const modLocation = i % Object.keys(gameStatus.players).length;
                const player = Object.values(gameStatus.players).find((u) => u.location == modLocation);
                if (!player.isDead && currentPlayer.playerId !== player.playerId) {
                    scrollResStages.push({
                        originId: player.playerId,
                        targetId: action.originId,
                        cards: action.cards,
                        actualCard: action.actualCard,
                        isEffect: false,
                    })
                }
            }
            gameStatus.scrollResStages = scrollResStages
        }

        const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus)
        if (hasWuxiePlayers.length > 0) {
            generateWuxieSimultaneousResStageByScroll(gameStatus)
        } else { // 没人有无懈可击直接生效
            setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus);
        }
    },

    // DELAY
    setStatusByLeBuSiShuAction: (gameStatus) => {
        const action = gameStatus.action;
        const targetPlayer = gameStatus.players[action.targetId]
        targetPlayer.pandingSigns.push({
            card: action.cards[0],
            actualCard: action.actualCard,
        });
    },
    setStatusByShanDianAction: (gameStatus) => {
        const action = gameStatus.action;
        const originPlayer = gameStatus.players[action.originId]
        originPlayer.pandingSigns.push({
            card: action.cards[0],
            actualCard: action.actualCard,
        });
    },

    // Equipment
    setStatusByEquipmentAction: (gameStatus) => {
        const action = gameStatus.action;
        const originPlayer = gameStatus.players[action.originId]

        const equipmentType = action.actualCard.equipmentType;
        if (equipmentType == EQUIPMENT_TYPE.PLUS_HORSE) {
            originPlayer.plusHorseCard = action.actualCard;
        } else if (equipmentType == EQUIPMENT_TYPE.MINUS_HORSE) {
            originPlayer.minusHorseCard = action.actualCard;
        } else if (equipmentType == EQUIPMENT_TYPE.WEAPON) {
            originPlayer.weaponCard = action.actualCard;
        } else if (equipmentType == EQUIPMENT_TYPE.SHIELD) {
            originPlayer.shieldCard = action.actualCard;
        }
    },
}

exports.actionHandler = actionHandler;