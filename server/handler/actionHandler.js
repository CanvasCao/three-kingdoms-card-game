const {EQUIPMENT_TYPE, SCROLL_CARDS_CONFIG} = require("../initCards")
const {getAllHasWuxieUsers} = require("../utils/userUtils");
const {generateWuxieSimultaneousResStageByScroll, setGameStatusWhenScrollTakeEffectAndMakeSureNoBodyWantsPlayXuxie} = require("../utils/wuxieUtils");
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
        const originUser = gameStatus.users[action.originId]
        if (originUser.currentBlood < originUser.maxBlood) {
            originUser.addBlood();
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
    setStatusByScrollAction(gameStatus) {
        const action = gameStatus.action;

        if (action.targetIds) {
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

        } else if (action.targetId) {
            gameStatus.scrollResStages = [{
                originId: action.originId,
                targetId: action.targetId,
                cards: action.cards,
                actualCard: action.actualCard,
                isEffect: false,
            }]
        } else if (action.actualCard.CN == SCROLL_CARDS_CONFIG.TAO_YUAN_JIE_YI.CN) {
            const targetIds = Object.values(gameStatus.users).filter((u) => u.currentBlood < u.maxBlood).map((u) => u.userId);
            if (targetIds.length) {
                gameStatus.scrollResStages = targetIds.map((targetId) => {
                    return {
                        originId: action.originId,
                        targetId: targetId,
                        cards: action.cards,
                        actualCard: action.actualCard,
                        isEffect: false,
                        stageId: uuidv4(), // 前端刷新Board的依据
                    }
                })
            } else {
                return // 都满血直接return
            }
        }

        const hasWuxiePlayers = getAllHasWuxieUsers(gameStatus)
        if (hasWuxiePlayers.length > 0) {
            generateWuxieSimultaneousResStageByScroll(gameStatus)
        } else { // 没人有无懈可击直接生效
            setGameStatusWhenScrollTakeEffectAndMakeSureNoBodyWantsPlayXuxie(gameStatus);
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