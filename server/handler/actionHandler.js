const {EQUIPMENT_TYPE} = require("../initCards")
const {getCurrentUser, getAllHasWuxieUsers} = require("../utils/userUtils");
const {generateWuxieSimultaneousResStageByScroll, setGameStatusWhenScrollTakeEffect} = require("../utils/wuxieUtils");

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
        const originUser = gameStatus.users[action.originId]
        if (originUser.currentBlood < originUser.maxBlood) {
            originUser.addBlood();
        }
    },

    // SCROLL
    setStatusByWuZhongShengYouAction(gameStatus) {
        const currentUser = getCurrentUser(gameStatus);
        const action = gameStatus.action;
        gameStatus.scrollResStages = [{
            originId: action.originId,
            targetId: action.targetId,
            cards: action.cards,
            actualCard: action.actualCard,
            isEffect: false,
        }]
        const hasWuxiePlayers = getAllHasWuxieUsers(gameStatus)

        if (hasWuxiePlayers.length > 0) {
            generateWuxieSimultaneousResStageByScroll(gameStatus)
        } else { // 没人有无懈可击直接生效
            setGameStatusWhenScrollTakeEffect(gameStatus);
        }
    },
    setStatusByGuoHeChaiQiaoAction(gameStatus) {
        const currentUser = getCurrentUser(gameStatus);
        const action = gameStatus.action;
        gameStatus.scrollResStages = [{
            originId: action.originId,
            targetId: action.targetId,
            cards: action.cards,
            actualCard: action.actualCard,
            isEffect: false,
        }]
        const hasWuxiePlayers = getAllHasWuxieUsers(gameStatus)

        if (hasWuxiePlayers.length > 0) {
            generateWuxieSimultaneousResStageByScroll(gameStatus)
        } else { // 没人有无懈可击直接生效
            setGameStatusWhenScrollTakeEffect(gameStatus);
        }
    },

    // DELAY
    setStatusByLeBuSiShuAction: (gameStatus) => {
        const action = gameStatus.action;
        const targetUser = gameStatus.users[action.targetId]
        targetUser.pandingSigns.push({
            card: action.cards[0],
            actualCard: action.actualCard,
        });
    },
    setStatusByShanDianAction: (gameStatus) => {
        const action = gameStatus.action;
        const originUser = gameStatus.users[action.originId]
        originUser.pandingSigns.push({
            card: action.cards[0],
            actualCard: action.actualCard,
        });
    },

    // Equipment
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