const {handleDrawCardsNumberWhenPlayImmediateScroll} = require("./skills/common");
const strikeEvent = require("../event/strikeEvent");
const {
    SCROLL_CARDS_CONFIG,
} = require("../config/cardConfig")
const {
    getCurrentPlayer,
    getAllAlivePlayersStartFromFirstLocation
} = require("../utils/playerUtils");
const {getCards} = require("../utils/cardUtils");
const {ACTION} = require("../action/action")

const actionHandler = {
    setStatusByShaAction: (gameStatus) => {
        const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;

        ACTION.use(gameStatus, gameStatus.action)

        strikeEvent.generateUseStrikeEventsThenSetNextStrikeEventSkill(
            gameStatus, {originId, targetIds, cards, actualCard}
        );
    },
    setStatusByTaoAction: (gameStatus) => {
        const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;

        ACTION.use(gameStatus, gameStatus.action)

        const originPlayer = gameStatus.players[originId]
        originPlayer.addBlood();
    },

    // SCROLL
    setStatusByScrollAction(gameStatus) {
        const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;

        // 黄月英急智
        const originPlayer = gameStatus.players[originId]
        handleDrawCardsNumberWhenPlayImmediateScroll(gameStatus, originPlayer)

        ACTION.use(gameStatus, gameStatus.action)

        // targetIds 只有顺和拆 originId targetIds的值和action一样
        if (actualCard.key == SCROLL_CARDS_CONFIG.SHUN_SHOU_QIAN_YANG.key ||
            actualCard.key == SCROLL_CARDS_CONFIG.GUO_HE_CHAI_QIAO.key) {
            gameStatus.scrollStorages = targetIds.map((targetId) => {
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
             scrollStorages=[{
                    originId: A,
                    targetId: B,
                    isEffect:false,
                }]

             1.失效
             scrollStorages=[]

             2.生效
             scrollStorages=[{
                    originId: A,
                    targetId: B,
                    isEffect:true,
                }]

             2.1 出杀
             scrollStorages=[]
             generateUseStrikeEventsThenSetNextStrikeEventSkill

             2.2 不出杀
             scrollStorages=[]
             A remove weapon
             CurrentPlayer add weapon
             **/
            gameStatus.scrollStorages = [{
                originId: targetIds[0],
                targetId: targetIds[1],
                cardTakeEffectOnPlayerId: targetIds[0],
                cards,
                actualCard,
                isEffect: undefined,
            }]
        } else if (actualCard.key == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.key) {
            gameStatus.scrollStorages = [{
                originId: originId,
                targetId: targetIds[0],
                cardTakeEffectOnPlayerId: originId,
                cards,
                actualCard,
                isEffect: undefined,
            }]
        } else if (actualCard.key == SCROLL_CARDS_CONFIG.JUE_DOU.key) {
            // 决斗originId targetId的值相反
            gameStatus.scrollStorages = [{
                originId: targetIds[0],
                targetId: originId,
                cardTakeEffectOnPlayerId: targetIds[0],
                cards,
                actualCard,
                isEffect: undefined,
            }]
        } else if (actualCard.key == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.key) {
            const players = getAllAlivePlayersStartFromFirstLocation(gameStatus, getCurrentPlayer(gameStatus).location)
            gameStatus.scrollStorages = players.filter((p) => p.currentBlood < p.maxBlood).map((player) => {
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

            const scrollStorages = players.filter(p => p.playerId !== currentPlayer.playerId).map((player) => {
                return {
                    originId: player.playerId,
                    targetId: originId,
                    cardTakeEffectOnPlayerId: player.playerId,
                    cards,
                    actualCard,
                    isEffect: undefined,
                }
            })
            gameStatus.scrollStorages = scrollStorages
        } else if (actualCard.key == SCROLL_CARDS_CONFIG.WU_GU_FENG_DENG.key) {
            const currentPlayer = getCurrentPlayer(gameStatus);
            const firstLocation = currentPlayer.location;
            const players = getAllAlivePlayersStartFromFirstLocation(gameStatus, firstLocation)

            const scrollStorages = players.map((player) => {
                return {
                    originId: player.playerId,
                    cards,
                    cardTakeEffectOnPlayerId: player.playerId,
                    actualCard,
                    isEffect: undefined,
                }
            })
            gameStatus.scrollStorages = scrollStorages

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
        ACTION.use(gameStatus, gameStatus.action)
    },

    // Equipment
    setStatusByEquipmentAction: (gameStatus) => {
        const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;
        const originPlayer = gameStatus.players[originId]
        const equipmentCard = cards[0]
        ACTION.equip(gameStatus, originPlayer, equipmentCard)
    },
}

exports.actionHandler = actionHandler;