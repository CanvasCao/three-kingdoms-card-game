const {EQUIPMENT_MAP} = require("../config/equipmentConfig");
const {CARD_LOCATION} = require("../config/cardConfig");
const {ADD_TO_PUBLIC_CARD_TYPE} = require("../config/emitConfig");
const {emitNotifyPublicCards} = require("../utils/emitUtils");
const {SCROLL_CARDS_CONFIG} = require("../config/cardConfig");
const {emitNotifyAddLines} = require("../utils/emitUtils");
const {emitNotifyPlayPublicCards} = require("../utils/emitUtils");
const {getCardsFromDeck} = require("../utils/cardUtils");
const {emitNotifyDrawCards, emitNotifyMoveCards} = require("../utils/emitUtils");
const {moveCardsToDiscardPile} = require("../utils/cardUtils")

const ACTION = {
    // ----------- 卡牌使用 -----------
    use(gameStatus, action) {
        const {originId, targetIds, actualCard, cards, skillKey} = action;
        const isDelayScroll = SCROLL_CARDS_CONFIG[actualCard?.key]?.isDelay
        this._removeCard(gameStatus, gameStatus.players[originId], cards)

        if (!isDelayScroll) {
            moveCardsToDiscardPile(gameStatus, cards);
        } else {
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
        }

        emitNotifyPlayPublicCards(gameStatus, action);
        emitNotifyAddLines(gameStatus, {
            fromId: originId,
            toIds: targetIds,
            actualCard
        });
    },
    equip(gameStatus, player, card) {
        emitNotifyPlayPublicCards(gameStatus, gameStatus.action);
        this._removeCard(gameStatus, player, card)

        const playerEquipCardName = EQUIPMENT_MAP[card.equipmentType];
        const currentEquipCard = player[playerEquipCardName];
        if (currentEquipCard) {
            this._removeCard(gameStatus, player, currentEquipCard)
            moveCardsToDiscardPile(gameStatus, currentEquipCard);
        }
        player[playerEquipCardName] = card;
    },
    play(gameStatus, response) {
        const {cards, actualCard, originId, skillKey} = response
        this._removeCard(gameStatus, gameStatus.players[originId], cards)

        moveCardsToDiscardPile(gameStatus, response.cards);
        emitNotifyPlayPublicCards(gameStatus, response);
    },

    // ----------- 卡牌移动 -----------
    // 拆
    remove(gameStatus, originPlayer, targetPlayer, card) {
        this._removeCard(gameStatus, targetPlayer, card)
        moveCardsToDiscardPile(gameStatus, card);
        emitNotifyPublicCards(gameStatus, {fromId: targetPlayer.playerId, cards: [card], type: ADD_TO_PUBLIC_CARD_TYPE.CHAI})
    },

    // 顺
    move(gameStatus, originPlayer, targetPlayer, card) {
        originPlayer.addCards(card);
        this._removeCard(gameStatus, targetPlayer, card)

        const isPublic = !targetPlayer.cards.find((c) => c.cardId == card.cardId)
        emitNotifyMoveCards(gameStatus, targetPlayer.playerId, originPlayer.playerId, [card], isPublic)
    },

    // 仁德 反间
    give(gameStatus, originPlayer, targetPlayer, cards, isPublic) {
        targetPlayer.addCards(cards);
        this._removeCard(gameStatus, originPlayer, cards)

        emitNotifyMoveCards(gameStatus, originPlayer.playerId, targetPlayer.playerId, cards, isPublic)
    },

    // 五谷 奸雄
    getFromTable(gameStatus, player, cards) {
        player.addCards(cards);
        emitNotifyMoveCards(gameStatus,
            CARD_LOCATION.TABLE,
            player.playerId,
            cards,
            true)
    },

    // ----------- 其他 -----------
    draw(gameStatus, player, number = 2) {
        const cards = getCardsFromDeck(gameStatus, number)
        player.addCards(cards);
        emitNotifyDrawCards(gameStatus, player, cards)
    },

    discard(gameStatus, player, cards, skillKey) {
        this._removeCard(gameStatus, player, cards)
        moveCardsToDiscardPile(gameStatus, cards);
        emitNotifyPublicCards(gameStatus, {fromId: player.playerId, cards, skillKey})
    },

    gaiPan(gameStatus, player, cards, pandingResultCard, skillKey) {
        this._removeCard(gameStatus, player, cards)
        moveCardsToDiscardPile(gameStatus, pandingResultCard);
        emitNotifyPublicCards(gameStatus, {fromId: player.playerId, cards, skillKey})
    },

    throw(gameStatus, player, cards) {
        this._removeCard(gameStatus, player, cards)
        moveCardsToDiscardPile(gameStatus, cards);
        emitNotifyPublicCards(gameStatus, {fromId: player.playerId, cards, type: ADD_TO_PUBLIC_CARD_TYPE.THROW})
    },

    _removeCard(gameStatus, player, cards) {
        if(!cards){
            return
        }

        if (player.cardsWillRemove) {
            player.cardsWillRemove(player, cards, gameStatus)
        }

        player.removeCards(cards)

        if (player.cardsRemoved) {
            player.cardsRemoved(player, gameStatus) // 陆逊
        }
    }
}

exports.ACTION = ACTION;