const {SCROLL_CARDS_CONFIG, EQUIPMENT_TYPE} = require("../initCards")
const {getCards} = require("../utils/cardUtils")
const {getCurrentUser} = require("../utils/userUtils")
const actionHandler = {
    setStatusByShaAction: (gameStatus) => {
        const action = gameStatus.action;
        gameStatus.shanResStages = action.actions.map((a) => {
            return {
                originId: a.targetId,
                targetId: a.originId,
                cardNumber: 1,
            }
        })
    },
    setStatusByTaoAction: (gameStatus) => {
        const action = gameStatus.action;
        const originUser = gameStatus.users[action.originId]
        if (originUser.currentBlood < originUser.maxBlood) {
            originUser.addBlood();
        }
    },
    setStatusByWuZhongShengYouAction(gameStatus) {
        const currentUser = getCurrentUser(gameStatus)
        const action = gameStatus.action;
        gameStatus.scrollResStages = [{
            originId: action.originId,
            targetId: action.targetId,
            cards: action.cards,
            actualCard: action.actualCard,
            isEffect: false,
        }]
        const hasWuxiePlayers = Object.values(gameStatus.users).filter((u) => u.cards.map((c) => c.CN).includes(SCROLL_CARDS_CONFIG.WU_XIE_KE_JI.CN));

        if (hasWuxiePlayers.length > 0) {
            gameStatus.wuxieResStage = {
                hasWuxiePlayerIds: hasWuxiePlayers.map((u) => u.userId),
                wuxieChain: [{
                    originId: action.originId,
                    targetId: action.targetId,
                    cards: action.cards,
                    actualCard: action.actualCard
                }]
            }
        } else { // 没人有无懈可击直接生效
            currentUser.addCards(getCards(gameStatus,2));
            gameStatus.scrollResStages = []
            gameStatus.wuxieResStage = {
                hasWuxiePlayerIds: [],
                wuxieChain: []
            }

        }
    },
    setStatusByLeBuSiShuAction: (gameStatus) => {
        const action = gameStatus.action;
        const targetUser = gameStatus.users[action.targetId]
        targetUser.pandingCards.push(action.actualCard)
    },

    setStatusByShanDianAction: (gameStatus) => {
        const action = gameStatus.action;
        const originUser = gameStatus.users[action.originId]
        originUser.pandingCards.push(action.actualCard)
    },

    setStatusByEquipmentAction: (gameStatus) => {
        const action = gameStatus.action;
        const originUser = gameStatus.users[action.originId]

        const equipmentType = action.actualCard.equipmentType;
        if (equipmentType == EQUIPMENT_TYPE.PLUS_HORSE) {
            originUser.plusHorseCard = action.actualCard;
        } else if (equipmentType == EQUIPMENT_TYPE.MINUS_HORSE) {
            originUser.minusHorseCard = action.actualCard;
        } else if (equipmentType == EQUIPMENT_TYPE.WEAPON) {
            originUser.weaponCard = action.actualCard;
        } else if (equipmentType == EQUIPMENT_TYPE.SHIELD) {
            originUser.shieldCard = action.actualCard;
        }
    },
}

exports.actionHandler = actionHandler;