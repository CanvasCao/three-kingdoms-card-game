const strikeEvent = require("../event/strikeEvent");
const sampleSize = require("lodash/sampleSize");
const {handleWu004KuRouAction} = require("../handler/skills/WU004");
const {CARD_CONFIG} = require("../config/cardConfig");
const {handleShu001RenDeAction} = require("../handler/skills/SHU001");
const {SKILL_CONFIG} = require("../config/skillsConfig");
const {GAME_STATUS} = require("../config/gameAndStageConfig");
const {STAGE_NAME} = require("../config/gameAndStageConfig");
const {ALL_SHA_CARD_KEYS} = require("../config/cardConfig");
const {reorderRoomPlayers} = require("../utils/roomUtils");
const {trySetNextGameStageEventSkill} = require("../event/gameStageEvent");
const {generateGameStageEventThenSetNextGameStageEventSkill} = require("../event/gameStageEvent");
const {endPlayHandler} = require("../handler/endPlayHandler");
const {Player} = require("./Player");
const {getHeroConfig} = require("../config/heroConfig");
const {everyoneGetInitialCards} = require("../utils/cardUtils");
const {heroSelectBoardBoardHandler} = require("../handler/heroSelectBoardHandler");
const {RESPONSE_TYPE_CONFIG} = require("../config/responseTypeConfig");
const {getResponseType} = require("../utils/responseUtils");
const {trySettleNextScroll} = require("../utils/afterActionAndResponseUtils");
const {tryFindNextSkillResponse} = require("../utils/afterActionAndResponseUtils");
const {
    getInitCards,
} = require("../initCards");
const {
    CARD_TYPE,
    BASIC_CARDS_CONFIG,
    SCROLL_CARDS_CONFIG,
} = require("../config/cardConfig")
const {
    emitRefreshStatus,
    emitInit,
    emitNotifyPlayPublicCard,
    emitNotifyCardBoardAction,
    emitNotifyAddLines,
    emitNotifyThrowPlayPublicCard,
    emitNotifyGetCardsFromTable,
} = require("../utils/emitUtils");
const {
    throwCards
} = require("../utils/cardUtils");
const {actionHandler} = require("../handler/actionHandler");
const {responseCardHandler} = require("../handler/responseHandler");
const {throwHandler} = require("../handler/throwHandler");
const {cardBoardHandler} = require("../handler/cardBoardHandler");
const {wuguBoardHandler} = require("../handler/wuguBoardHandler");
const {shuffle} = require("lodash/collection");

class GameEngine {
    constructor(io) {
        this.gameStatus = {
            room: {
                roomId: '',
                status: GAME_STATUS.IDLE,
            },
            players: {},
            stage: {
                stageName: STAGE_NAME.START,
                currentLocation: 0,
            },
            action: {},

            // 基础牌
            cardResponse: undefined,
            taoResponses: [],

            // skill
            skillResponse: undefined,

            // cardBoard
            cardBoardResponses: [],

            // 锦囊
            scrollResponses: [],
            wuxieSimultaneousResponse: {
                hasWuxiePlayerIds: [],
                wuxieChain: []// 等待全员无懈可击
            },

            // 其他
            wugufengdengCards: [],
            tieSuoTempStorage: [],

            // event
            gameStageEvent: undefined,
            useStrikeEvents: [],
            responseCardEvents: [],
            damageEvents: [],
            pandingEvent: undefined,

            // gameEnd
            gameEnd: undefined,

            // 不需要传到前端
            io: io,
            throwedCards: [],
            initCards: getInitCards(),
        }
    }

    setPlayers(roomPlayers) {
        const reorderedRoomPlayers = reorderRoomPlayers(roomPlayers);
        reorderedRoomPlayers.forEach((roomPlayer, i) => {
            const newPlayer = new Player({
                playerName: roomPlayer.playerName,
                playerId: roomPlayer.playerId,
                teamMember: roomPlayer.teamMember,
                location: i,
            });

            // 选将
            const allSelectHeroIds = [
                "WEI001", "WEI002", "WEI003", "WEI004", 'WEI005',
                "SHU001", "SHU002", "SHU003", "SHU005", "SHU006", "SHU007",
                "WU002", "WU004", "WU006",
                "QUN002"];
            const canSelectHeroIds = [...sampleSize(allSelectHeroIds, 7)]//, "SP001"];
            newPlayer.canSelectHeros = canSelectHeroIds.map(heroId => getHeroConfig(heroId))

            this.gameStatus.players[newPlayer.playerId] = newPlayer;
        })
    }

    startEngine(roomId) {
        this.gameStatus.room = {roomId, status: GAME_STATUS.PLAYING};
        emitInit(this.gameStatus);
    }

    handleAction(action) {
        const {originId, targetIds, actualCard, cards, skillKey} = action;
        this.gameStatus.action = action;
        this.gameStatus.players[originId].removeCards(cards);

        emitNotifyPlayPublicCard(this.gameStatus, action);
        emitNotifyAddLines(this.gameStatus, {
            fromId: originId,
            toIds: targetIds,
            actualCard
        });

        if (!actualCard?.key) {
            switch (skillKey) {
                case SKILL_CONFIG.SHU001_REN_DE.key:
                    handleShu001RenDeAction(this.gameStatus);
                    break;
                case SKILL_CONFIG.WU004_KU_ROU.key:
                    handleWu004KuRouAction(this.gameStatus);
                    break;
            }
        } else {
            const cardType = CARD_CONFIG[actualCard?.key].type;
            // BASIC
            if (ALL_SHA_CARD_KEYS.includes(actualCard?.key)) {
                strikeEvent.generateUseStrikeEventsThenSetNextStrikeEventSkill(
                    this.gameStatus, {originId, targetIds, cards, actualCard});
                throwCards(this.gameStatus, cards);
            } else if (actualCard?.key == BASIC_CARDS_CONFIG.TAO.key) {
                actionHandler.setStatusByTaoAction(this.gameStatus);
                throwCards(this.gameStatus, cards);
            }
            // Equipment
            else if (CARD_TYPE.EQUIPMENT == cardType) {
                actionHandler.setStatusByEquipmentAction(this.gameStatus);
            }
            // SCROLL
            else if (CARD_TYPE.SCROLL == cardType) {
                if (SCROLL_CARDS_CONFIG[actualCard?.key]?.isDelay) {
                    actionHandler.setStatusByDelayScrollAction(this.gameStatus);
                } else {
                    actionHandler.setStatusByScrollAction(this.gameStatus);
                    throwCards(this.gameStatus, cards);
                }
            }
        }

        tryFindNextSkillResponse(this.gameStatus);
        trySettleNextScroll(this.gameStatus);
        emitRefreshStatus(this.gameStatus);
    }

    handleResponse(response) {
        const responseType = getResponseType(this.gameStatus);
        emitNotifyPlayPublicCard(this.gameStatus, response);

        switch (responseType) {
            case RESPONSE_TYPE_CONFIG.TAO:
                responseCardHandler.setStatusByTaoResponse(this.gameStatus, response);
                break;
            case RESPONSE_TYPE_CONFIG.CARD:
                responseCardHandler.setStatusByCardResponse(this.gameStatus, response);
                break;
            case RESPONSE_TYPE_CONFIG.SKILL:
                responseCardHandler.setStatusBySkillResponse(this.gameStatus, response);
                break;
            case RESPONSE_TYPE_CONFIG.WUXIE:
                responseCardHandler.setStatusByWuxieResponse(this.gameStatus, response);
                break;
            case RESPONSE_TYPE_CONFIG.SCROLL:
                const curScrollResponse = this.gameStatus.scrollResponses[0];
                if (curScrollResponse.actualCard.key === SCROLL_CARDS_CONFIG.JIE_DAO_SHA_REN.key) {
                    responseCardHandler.setStatusByJieDaoResponse(this.gameStatus, response);
                }
                break;
        }

        // 第一个目标求闪/桃之后 继续找马超下一个铁骑的技能
        tryFindNextSkillResponse(this.gameStatus);

        // 下一个人自动响应锦囊 或求无懈
        trySettleNextScroll(this.gameStatus)

        // 打无懈可击延迟锦囊生效后/闪电求桃之后 需要判断是不是从判定阶段到出牌阶段
        trySetNextGameStageEventSkill(this.gameStatus);

        emitRefreshStatus(this.gameStatus);
    }

    handleEndPlay() {
        endPlayHandler.handleEndPlay(this.gameStatus)
        trySetNextGameStageEventSkill(this.gameStatus);
        emitRefreshStatus(this.gameStatus);
    }

    handleThrowCards(data) {
        emitNotifyThrowPlayPublicCard(this.gameStatus, data);

        throwHandler.handleThrowCards(this.gameStatus, data)
        emitRefreshStatus(this.gameStatus);

        trySetNextGameStageEventSkill(this.gameStatus);
        emitRefreshStatus(this.gameStatus);
    }

    handleCardBoardAction(data) {
        emitNotifyCardBoardAction(this.gameStatus, data)

        cardBoardHandler.handleCardBoard(this.gameStatus, data)

        // 第一个目标求闪/桃之后 继续找马超下一个铁骑的技能
        tryFindNextSkillResponse(this.gameStatus);

        // 下一个人自动响应锦囊 或求无懈
        trySettleNextScroll(this.gameStatus)

        // 打无懈可击延迟锦囊生效后/闪电求桃之后 需要判断是不是从判定阶段到出牌阶段
        trySetNextGameStageEventSkill(this.gameStatus);

        emitRefreshStatus(this.gameStatus);
    }

    handleWuguBoardAction(data) {
        emitNotifyGetCardsFromTable(this.gameStatus, {...data, cards: [data.card]});

        wuguBoardHandler.handleWuGuBoard(this.gameStatus, data)

        // 下一个五谷丰登
        trySettleNextScroll(this.gameStatus)
        emitRefreshStatus(this.gameStatus);
    }

    handleHeroSelectBoardAction(data) {
        heroSelectBoardBoardHandler.handleHeroSelect(this.gameStatus, data)

        if (Object.values(this.gameStatus.players).every((p) => p.heroId)) {
            everyoneGetInitialCards(this.gameStatus)
            generateGameStageEventThenSetNextGameStageEventSkill(this.gameStatus)
            emitRefreshStatus(this.gameStatus);
        }

        setTimeout(() => {
            emitRefreshStatus(this.gameStatus);
        }, 1000)
    }
}

exports.GameEngine = GameEngine;