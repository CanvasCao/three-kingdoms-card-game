const {emitNotifyThrowPlayPublicCard} = require("../utils/emitUtils");
const {SCROLL_CARDS_CONFIG} = require("../config/cardConfig");
const {EQUIPMENT_TYPE} = require("../config/cardConfig");
const {emitNotifyAddLines} = require("../utils/emitUtils");
const {emitNotifyPlayPublicCard} = require("../utils/emitUtils");
const {getCards} = require("../utils/cardUtils");
const {emitNotifyDrawCards, emitNotifyRemoveCard, emitNotifyMoveCards} = require("../utils/emitUtils");
const {moveCardsToDiscardPile} = require("../utils/cardUtils")

const ACTION = {
    use(gameStatus, action) {
        const {originId, targetIds, actualCard, cards, skillKey} = action;
        const isDelayScroll = SCROLL_CARDS_CONFIG[actualCard?.key]?.isDelay
        gameStatus.players[originId].removeCards(cards);

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

        emitNotifyPlayPublicCard(gameStatus, action);
        emitNotifyAddLines(gameStatus, {
            fromId: originId,
            toIds: targetIds,
            actualCard
        });
    },
    equip(gameStatus, player, card) {
        emitNotifyPlayPublicCard(gameStatus, gameStatus.action);
        player.removeCards(card)

        const equipmentType = card.equipmentType;
        if (equipmentType == EQUIPMENT_TYPE.PLUS_HORSE) {
            if (player.plusHorseCard) {
                player.removeCards(player.plusHorseCard)
                moveCardsToDiscardPile(gameStatus, player.plusHorseCard);
            }
            player.plusHorseCard = card;
        } else if (equipmentType == EQUIPMENT_TYPE.MINUS_HORSE) {
            if (player.minusHorseCard) {
                player.removeCards(player.minusHorseCard)
                moveCardsToDiscardPile(gameStatus, player.minusHorseCard);
            }
            player.minusHorseCard = card;
        } else if (equipmentType == EQUIPMENT_TYPE.WEAPON) {
            if (player.weaponCard) {
                player.removeCards(player.weaponCard)
                moveCardsToDiscardPile(gameStatus, player.weaponCard);
            }
            player.weaponCard = card;
        } else if (equipmentType == EQUIPMENT_TYPE.SHIELD) {
            if (player.shieldCard) {
                player.removeCards(player.shieldCard)
                moveCardsToDiscardPile(gameStatus, player.shieldCard);
            }
            player.shieldCard = card;
        }
    },
    play(gameStatus, response) {
        const {cards, actualCard, originId, skillKey} = response
        gameStatus.players[originId].removeCards(cards);
        moveCardsToDiscardPile(gameStatus, response.cards);
        emitNotifyPlayPublicCard(gameStatus, response);
    },
    remove(gameStatus, originPlayer, targetPlayer, card) {
        targetPlayer.removeCards(card);
        moveCardsToDiscardPile(gameStatus, card);
        emitNotifyRemoveCard(gameStatus, originPlayer, targetPlayer, card)
    },
    move(gameStatus, originPlayer, targetPlayer, card) {
        targetPlayer.removeCards(card);
        originPlayer.addCards(card);

        const isPublic = !targetPlayer.cards.find((c) => c.cardId == card.cardId)
        emitNotifyMoveCards(gameStatus, targetPlayer.playerId, originPlayer.playerId, [card], isPublic)
    },
    give(gameStatus, originPlayer, targetPlayer, cards) {
        targetPlayer.addCards(cards);
        originPlayer.removeCards(cards);
        emitNotifyMoveCards(gameStatus, originPlayer.playerId, targetPlayer.playerId, cards, false)
        emitNotifyAddLines(gameStatus, {
            fromId: originPlayer.playerId,
            toIds: targetPlayer.playerId,
        });
    },
    draw(gameStatus, player, number = 2) {
        const cards = getCards(gameStatus, number)
        player.addCards(cards);
        emitNotifyDrawCards(gameStatus, player, cards)
    },
    discard(gameStatus, player, cards) {
        player.removeCards(cards);
        moveCardsToDiscardPile(gameStatus, cards);
    },
    get() {
    },
    gaiPan(gameStatus, originPlayer, cards, pandingResultCard) {
        originPlayer.removeCards(cards);
        moveCardsToDiscardPile(gameStatus, pandingResultCard);
    },
    throw(gameStatus, player, cards) {
        player.removeCards(cards);
        moveCardsToDiscardPile(gameStatus, cards);
        emitNotifyThrowPlayPublicCard(gameStatus, {cards, playerId: player.playerId});
    }
}

exports.ACTION = ACTION;