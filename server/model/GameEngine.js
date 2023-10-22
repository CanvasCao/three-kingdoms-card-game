const sampleSize = require("lodash/sampleSize");
const {USE_OR_PLAY_CONFIG} = require("./Log");
const {Log} = require("./Log");
const {Stage} = require("./Stage");
const {handleWu001ZhiHengAction} = require("../handler/skills/WU001");
const {handleWu004KuRouAction} = require("../handler/skills/WU004");
const {CARD_CONFIG} = require("../config/cardConfig");
const {handleShu001RenDeAction} = require("../handler/skills/SHU001");
const {SKILL_CONFIG} = require("../config/skillsConfig");
const {GAME_STATUS} = require("../config/gameAndStageConfig");
const {ALL_SHA_CARD_KEYS} = require("../config/cardConfig");
const {reorderRoomPlayers} = require("../utils/roomUtils");
const {trySetNextGameStageEventSkill} = require("../event/gameStageEvent");
const {generateGameStageEventThenSetNextGameStageEventSkill} = require("../event/gameStageEvent");
const {endPlayHandler} = require("../handler/endPlayHandler");
const {Player} = require("./Player");
const {getHeroConfig} = require("../config/heroConfig");
const {everyoneGetInitialCards} = require("../utils/cardUtils");
const {getCurrentPlayer} = require("../utils/playerUtils");
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
} = require("../utils/emitUtils");
const {actionHandler} = require("../handler/actionHandler");
const {responseCardHandler} = require("../handler/responseHandler");
const {throwHandler} = require("../handler/throwHandler");
const {cardBoardHandler} = require("../handler/cardBoardHandler");
const {wuguBoardHandler} = require("../handler/wuguBoardHandler");
const {Rooms} = require("../model/Rooms");

class GameEngine {
    constructor(io) {
        this.gameStatus = {
            roomId: '',
            players: {},
            stage: new Stage(),
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
            log: new Log(),
            throwedCards: [],
            deckCards: getInitCards(),
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
                "WEI001", "WEI002", "WEI003", "WEI004", 'WEI005', "WEI007",
                "SHU001", "SHU002", "SHU003", "SHU005", "SHU006", "SHU007",
                "WU001", "WU002", "WU003", "WU004", "WU006", "WU007",
                "QUN002"];

            const canSelectHeroNumber = process.env.NODE_ENV == 'production' ? 3 : allSelectHeroIds.length
            const canSelectHeroIds = [
                ...sampleSize(allSelectHeroIds, canSelectHeroNumber),
                "WU005"
            ]
            newPlayer.canSelectHeros = canSelectHeroIds.map(heroId => getHeroConfig(heroId))

            this.gameStatus.players[newPlayer.playerId] = newPlayer;
        })
    }

    startEngine(roomId) {
        this.gameStatus.roomId = roomId;

        const rooms = new Rooms();
        rooms.setRoomStatus(roomId, GAME_STATUS.PLAYING)

        emitInit(this.gameStatus);
    }

    handleAction(action) {
        const {originId, targetIds, actualCard, cards, skillKey} = action;
        this.gameStatus.action = action;

        // 使用技能
        if (!actualCard?.key) {
            switch (skillKey) {
                case SKILL_CONFIG.SHU001_REN_DE.key:
                    handleShu001RenDeAction(this.gameStatus);
                    break;
                case SKILL_CONFIG.WU004_KU_ROU.key:
                    handleWu004KuRouAction(this.gameStatus);
                    break;
                case SKILL_CONFIG.WU001_ZHI_HENG.key:
                    handleWu001ZhiHengAction(this.gameStatus);
                    break;
            }
        }
        // 出牌
        else {
            // 出牌日志
            this.gameStatus.log.addLog({
                roundNumber: this.gameStatus.stage.getRoundNumber(),
                whoseRoundId: getCurrentPlayer(this.gameStatus).playerId,
                playerId: originId, addType: USE_OR_PLAY_CONFIG.USE,
                card: actualCard
            })

            const cardType = CARD_CONFIG[actualCard?.key].type;
            // BASIC
            if (ALL_SHA_CARD_KEYS.includes(actualCard?.key)) {
                actionHandler.setStatusByShaAction(this.gameStatus);
            } else if (actualCard?.key == BASIC_CARDS_CONFIG.TAO.key) {
                actionHandler.setStatusByTaoAction(this.gameStatus);
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
                }
            }
        }

        tryFindNextSkillResponse(this.gameStatus);
        trySettleNextScroll(this.gameStatus);
        emitRefreshStatus(this.gameStatus);
    }

    handleResponse(response) {
        const {actualCard, originId} = response
        const responseType = getResponseType(this.gameStatus);

        // 日志
        this.gameStatus.log.addLog({
            roundNumber: this.gameStatus.stage.getRoundNumber(),
            whoseRoundId: getCurrentPlayer(this.gameStatus).playerId,
            playerId: originId,
            addType: USE_OR_PLAY_CONFIG.PLAY,
            card: actualCard
        })

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
        throwHandler.handleThrowCards(this.gameStatus, data)
        emitRefreshStatus(this.gameStatus);

        trySetNextGameStageEventSkill(this.gameStatus);
        emitRefreshStatus(this.gameStatus);
    }

    handleCardBoardAction(data) {
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
        } else {
            emitRefreshStatus(this.gameStatus);
        }
    }
}

exports.GameEngine = GameEngine;