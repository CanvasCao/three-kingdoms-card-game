const {handleDrawCardsNumberWhenPlayImmediateScroll} = require("./skills/common");
const strikeEvent = require("../event/strikeEvent");
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

const actionHandler = {
    setStatusByShaAction: (gameStatus) => {
        const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;
        strikeEvent.generateUseStrikeEventsThenSetNextStrikeEventSkill(
            gameStatus, {originId, targetIds, cards, actualCard}
        );
    },
    setStatusByTaoAction: (gameStatus) => {
        const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;
        const originPlayer = gameStatus.players[originId]
        originPlayer.addBlood();
    },

    // SCROLL
    setStatusByScrollAction(gameStatus) {
        const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;

        // 黄月英急智
        const originPlayer = gameStatus.players[originId]
        handleDrawCardsNumberWhenPlayImmediateScroll(gameStatus, originPlayer)

        // targetIds 只有顺和拆 originId targetIds的值和action一样
        if (actualCard.key == SCROLL_CARDS_CONFIG.SHUN_SHOU_QIAN_YANG.key ||
            actualCard.key == SCROLL_CARDS_CONFIG.GUO_HE_CHAI_QIAO.key) {
            gameStatus.scrollResponses = targetIds.map((targetId) => {
                return {
                    originId,
                    targetId: targetId,
                    cardTakeEffectOnPlayerId: targetId,
                    cards,
                    actualCard,
                    isEffect: undefined,
                }
            })
        } else if (actualCard.key == SCROLL_CARDS_CONFIG.JIE_DAO_SHA_REN.key) {
            /**
             action={
                    origin:C,
                    targetIds:[A,B],
                    isEffect:false,
                }
             scrollResponses=[{
                    originId: A,
                    targetId: B,
                    isEffect:false,
                }]

             1.失效
             scrollResponses=[]

             2.生效
             scrollResponses=[{
                    originId: A,
                    targetId: B,
                    isEffect:true,
                }]

             2.1 出杀
             scrollResponses=[]
             generateUseStrikeEventsThenSetNextStrikeEventSkill

             2.2 不出杀
             scrollResponses=[]
             A remove weapon
             CurrentPlayer add weapon
             **/
            gameStatus.scrollResponses = [{
                originId: targetIds[0],
                targetId: targetIds[1],
                cardTakeEffectOnPlayerId: targetIds[0],
                cards,
                actualCard,
                isEffect: undefined,
            }]
        } else if (actualCard.key == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.key) {
            gameStatus.scrollResponses = [{
                originId: originId,
                targetId: targetIds[0],
                cardTakeEffectOnPlayerId: originId,
                cards,
                actualCard,
                isEffect: undefined,
            }]
        } else if (actualCard.key == SCROLL_CARDS_CONFIG.JUE_DOU.key) {
            // 决斗originId targetId的值相反
            gameStatus.scrollResponses = [{
                originId: targetIds[0],
                targetId: originId,
                cardTakeEffectOnPlayerId: targetIds[0],
                cards,
                actualCard,
                isEffect: undefined,
            }]
        } else if (actualCard.key == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.key) {
            const players = getAllAlivePlayersStartFromFirstLocation(gameStatus, getCurrentPlayer(gameStatus).location)
            gameStatus.scrollResponses = players.filter((p) => p.currentBlood < p.maxBlood).map((player) => {
                return {
                    originId: player.playerId,
                    cardTakeEffectOnPlayerId: player.playerId,
                    cards,
                    actualCard,
                    isEffect: undefined,
                }
            })
        } else if (actualCard.key == SCROLL_CARDS_CONFIG.NAN_MAN_RU_QIN.key ||
            actualCard.key == SCROLL_CARDS_CONFIG.WAN_JIAN_QI_FA.key) {
            const currentPlayer = getCurrentPlayer(gameStatus);
            const firstLocation = currentPlayer.location;
            const players = getAllAlivePlayersStartFromFirstLocation(gameStatus, firstLocation)

            const scrollResponses = players.filter(p => p.playerId !== currentPlayer.playerId).map((player) => {
                return {
                    originId: player.playerId,
                    targetId: originId,
                    cardTakeEffectOnPlayerId: player.playerId,
                    cards,
                    actualCard,
                    isEffect: undefined,
                }
            })
            gameStatus.scrollResponses = scrollResponses
        } else if (actualCard.key == SCROLL_CARDS_CONFIG.WU_GU_FENG_DENG.key) {
            const currentPlayer = getCurrentPlayer(gameStatus);
            const firstLocation = currentPlayer.location;
            const players = getAllAlivePlayersStartFromFirstLocation(gameStatus, firstLocation)

            const scrollResponses = players.map((player) => {
                return {
                    originId: player.playerId,
                    cards,
                    cardTakeEffectOnPlayerId: player.playerId,
                    actualCard,
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
    setStatusByDelayScrollAction: (gameStatus) => {
        const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;

        const targetPlayer = gameStatus.players[targetIds[0]]
        const originPlayer = gameStatus.players[originId]
        const actualCardKey = actualCard?.key
        if (actualCardKey === SCROLL_CARDS_CONFIG.SHAN_DIAN.key) {
            originPlayer.pandingSigns.push({
                card: cards[0],
                actualCard,
            });
        } else if (actualCardKey === SCROLL_CARDS_CONFIG.LE_BU_SI_SHU.key) {
            targetPlayer.pandingSigns.push({
                card: cards[0],
                actualCard,
            });
        }
    },

    // Equipment
    setStatusByEquipmentAction: (gameStatus) => {
        const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;

        const originPlayer = gameStatus.players[originId]
        const equipmentCard = cards[0]
        const equipmentType = equipmentCard.equipmentType;
        if (equipmentType == EQUIPMENT_TYPE.PLUS_HORSE) {
            if (originPlayer.plusHorseCard) {
                throwCards(gameStatus, originPlayer.plusHorseCard);
            }
            originPlayer.plusHorseCard = equipmentCard;
        } else if (equipmentType == EQUIPMENT_TYPE.MINUS_HORSE) {
            if (originPlayer.minusHorseCard) {
                throwCards(gameStatus, originPlayer.minusHorseCard);
            }
            originPlayer.minusHorseCard = equipmentCard;
        } else if (equipmentType == EQUIPMENT_TYPE.WEAPON) {
            if (originPlayer.weaponCard) {
                throwCards(gameStatus, originPlayer.weaponCard);
            }
            originPlayer.weaponCard = equipmentCard;
        } else if (equipmentType == EQUIPMENT_TYPE.SHIELD) {
            if (originPlayer.shieldCard) {
                throwCards(gameStatus, originPlayer.shieldCard);
            }
            originPlayer.shieldCard = equipmentCard;
        }
    },
}

exports.actionHandler = actionHandler;