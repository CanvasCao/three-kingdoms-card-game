const {
    EQUIPMENT_TYPE,
    SCROLL_CARDS_CONFIG,
} = require("../config/cardConfig")
const {
    getCurrentPlayer,
    getAllAlivePlayersStartFromFirstLocation
} = require("../utils/playerUtils");
const {
    getCards,
    throwCards
} = require("../utils/cardUtils");
const {v4: uuidv4} = require('uuid');

const actionHandler = {
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
        // scrollResponses=[{
        //     originId: A,
        //     targetId: B,
        //     isEffect:false,
        // }]

        // 1.失效
        // scrollResponses=[]
        //
        // 2.生效
        // scrollResponses=[{
        //     originId: A,
        //     targetId: B,
        //     isEffect:true,
        // }]
        //
        // 2.1 出杀
        // scrollResponses=[]
        // shanResponse = {
        //     originId: B,
        //     targetId: A,
        //     cardNumber: 1,
        // }
        //
        // 2.2 不出杀
        // scrollResponses=[]
        // A remove weapon
        // CurrentPlayer add weapon

        actionHandler.setStatusByScrollAction(gameStatus);
    },
    setStatusByWuGuFengDengAction(gameStatus) {
        actionHandler.setStatusByScrollAction(gameStatus);
    },
    setStatusByScrollAction(gameStatus) {
        const action = gameStatus.action;

        // targetIds 只有顺和拆 桃园 originId targetIds的值和action一样
        if (action.targetIds) {
            if (action.actualCard.CN == SCROLL_CARDS_CONFIG.SHUN_SHOU_QIAN_YANG.CN ||
                action.actualCard.CN == SCROLL_CARDS_CONFIG.GUO_HE_CHAI_QIAO.CN) {
                gameStatus.scrollResponses = action.targetIds.map((targetId) => {
                    return {
                        originId: action.originId,
                        targetId: targetId,
                        cardTakeEffectOnPlayerId: targetId,
                        cards: action.cards,
                        actualCard: action.actualCard,
                        isEffect: undefined,
                    }
                })
            } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.JIE_DAO_SHA_REN.CN) {
                gameStatus.scrollResponses = [{
                    originId: action.targetIds[0],
                    targetId: action.targetIds[1],
                    cardTakeEffectOnPlayerId: action.targetIds[0],
                    cards: action.cards,
                    actualCard: action.actualCard,
                    isEffect: undefined,
                }]
            }
        } else if (action.targetId) {
            if (action.actualCard.CN == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.CN) {
                gameStatus.scrollResponses = [{
                    originId: action.originId,
                    targetId: action.targetId,
                    cardTakeEffectOnPlayerId: action.originId,
                    cards: action.cards,
                    actualCard: action.actualCard,
                    isEffect: undefined,
                }]
            } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.JUE_DOU.CN) {
                // 决斗originId targetId的值相反
                gameStatus.scrollResponses = [{
                    originId: action.targetId,
                    targetId: action.originId,
                    cardTakeEffectOnPlayerId: action.targetId,
                    cards: action.cards,
                    actualCard: action.actualCard,
                    isEffect: undefined,
                }]
            }
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.CN) {
            const players = getAllAlivePlayersStartFromFirstLocation(gameStatus, getCurrentPlayer(gameStatus).location)
            gameStatus.scrollResponses = players.filter((p) => p.currentBlood < p.maxBlood).map((player) => {
                return {
                    originId: player.playerId,
                    cardTakeEffectOnPlayerId: player.playerId,
                    cards: action.cards,
                    actualCard: action.actualCard,
                    isEffect: undefined,
                }
            })
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.NAN_MAN_RU_QIN.CN ||
            action.actualCard.CN == SCROLL_CARDS_CONFIG.WAN_JIAN_QI_FA.CN) {
            const currentPlayer = getCurrentPlayer(gameStatus);
            const firstLocation = currentPlayer.location;
            const players = getAllAlivePlayersStartFromFirstLocation(gameStatus, firstLocation)

            const scrollResponses = players.filter(p => p.playerId !== currentPlayer.playerId).map((player) => {
                return {
                    originId: player.playerId,
                    targetId: action.originId,
                    cardTakeEffectOnPlayerId: player.playerId,
                    cards: action.cards,
                    actualCard: action.actualCard,
                    isEffect: undefined,
                }
            })
            gameStatus.scrollResponses = scrollResponses
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.WU_GU_FENG_DENG.CN) {
            const currentPlayer = getCurrentPlayer(gameStatus);
            const firstLocation = currentPlayer.location;
            const players = getAllAlivePlayersStartFromFirstLocation(gameStatus, firstLocation)

            const scrollResponses = players.map((player) => {
                return {
                    originId: player.playerId,
                    cards: action.cards,
                    cardTakeEffectOnPlayerId: player.playerId,
                    actualCard: action.actualCard,
                    isEffect: undefined,
                }
            })
            gameStatus.scrollResponses = scrollResponses

            // 有wugufengdengCards展示WuGuFengDengBoard
            let cardNumber;
            cardNumber = process.env.NODE_ENV == 'production' ? players.length : 8;
            if (cardNumber <= 1) {
                cardNumber = 2;
            }
            gameStatus.wugufengdengCards = getCards(gameStatus, cardNumber)
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
        const equipmentCard = action.cards[0]
        const equipmentType = equipmentCard.equipmentType;
        if (equipmentType == EQUIPMENT_TYPE.PLUS_HORSE) {
            if (originPlayer.plusHorseCard) {
                throwCards(gameStatus, equipmentCard);
            }
            originPlayer.plusHorseCard = equipmentCard;
        } else if (equipmentType == EQUIPMENT_TYPE.MINUS_HORSE) {
            if (originPlayer.minusHorseCard) {
                throwCards(gameStatus, equipmentCard);
            }
            originPlayer.minusHorseCard = equipmentCard;
        } else if (equipmentType == EQUIPMENT_TYPE.WEAPON) {
            if (originPlayer.weaponCard) {
                throwCards(gameStatus, equipmentCard);
            }
            originPlayer.weaponCard = equipmentCard;
        } else if (equipmentType == EQUIPMENT_TYPE.SHIELD) {
            if (originPlayer.shieldCard) {
                throwCards(gameStatus, equipmentCard);
            }
            originPlayer.shieldCard = equipmentCard;
        }
    },
}

exports.actionHandler = actionHandler;