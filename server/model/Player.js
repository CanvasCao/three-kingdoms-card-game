const {EQUIPMENT_CARDS_CONFIG, EQUIPMENT_TYPE, CARD_HUASE} = require("../config/cardConfig");
const {Card} = require("./Card");
const {differenceBy} = require("lodash/array");
const {v4: uuidv4} = require('uuid');

class Player {
    constructor(player, generateNewRoundQiuTaoResponses) {
        this.maxBlood = 4;
        this.currentBlood = 3 || this.maxBlood;
        this.heroId = player.heroId;
        this.playerId = player.playerId;
        this.name = player.name;
        this.location = player.location;

        // cards
        this.cards = [];

        // pandingSigns
        this.pandingSigns = [];
        this.weaponCard = process.env.NODE_ENV == 'production' ? null : {
            "huase": CARD_HUASE.CAOHUA,
            "number": 1,
            "key": "ZHU_GE_LIAN_NU",
            "KEY": "ZHU_GE_LIAN_NU",
            "cardId": uuidv4(),
            "cardNumDesc": "A",
            "CN": EQUIPMENT_CARDS_CONFIG.ZHANG_BA_SHE_MAO.CN,
            "EN": "Green Steel Sword",
            "type": "EQUIPMENT",
            "equipmentType": EQUIPMENT_TYPE.WEAPON,
            "distance": 3,
            "distanceDesc": "三",
        };
        this.shieldCard = process.env.NODE_ENV == 'production' ? null : {
            "huase": CARD_HUASE.CAOHUA,
            "number": 2,
            "key": "BA_GUA_ZHEN",
            "KEY": "BA_GUA_ZHEN",
            "cardId": uuidv4(),
            "cardNumDesc": 2,
            "CN": EQUIPMENT_CARDS_CONFIG.REN_WANG_DUN.CN,
            "EN": "Eight Diagrams",
            "type": "EQUIPMENT",
            "equipmentType": "SHIELD"
        };
        this.plusHorseCard = null;
        this.minusHorseCard = null;

        // ui tags
        this.isTieSuo = false;

        // delay scroll tags
        this.judgedShandian = false;
        this.skipDraw = false;
        this.skipPlay = false;

        // played tags
        this.shaTimes = 0;

        this.isDead = false

        // 耦合 掉血和求桃
        this.generateNewRoundQiuTaoResponses = generateNewRoundQiuTaoResponses;

    }

    addCards(cards) {
        if (!cards) {
            return
        }
        let addingCards = Array.isArray(cards) ? cards : [cards]
        addingCards = addingCards.map(c => new Card(c))
        this.cards = this.cards.concat(addingCards)
    }

    hasAnyHandCardsOrEquipmentCards() {
        return this.cards.length ||
            this.plusHorseCard ||
            this.minusHorseCard ||
            this.shieldCard ||
            this.weaponCard
    }

    _removeHandCards(cards) {
        if (!cards) {
            return
        }
        let removingCards = Array.isArray(cards) ? cards : [cards]
        this.cards = differenceBy(this.cards, removingCards, 'cardId');
    }

    removeCards(cards) {
        if (!cards) {
            return
        }
        this._removeHandCards(cards)
        const removeCards = Array.isArray(cards) ? cards : [cards]
        const removeCardIds = removeCards.map(c => c.cardId);
        this.weaponCard = removeCardIds.includes(this.weaponCard?.cardId) ? null : this.weaponCard;
        this.shieldCard = removeCardIds.includes(this.shieldCard?.cardId) ? null : this.shieldCard;
        this.plusHorseCard = removeCardIds.includes(this.plusHorseCard?.cardId) ? null : this.plusHorseCard;
        this.minusHorseCard = removeCardIds.includes(this.minusHorseCard?.cardId) ? null : this.minusHorseCard;

        const fakeSigns = removeCardIds.map((rId) => {
            return {
                card: {cardId: rId}
            }
        })
        this.pandingSigns = differenceBy(this.pandingSigns, fakeSigns, 'card.cardId');
    }

    removePandingSign(sign) {
        this.pandingSigns = differenceBy(this.pandingSigns, [sign], 'card.cardId');
    }

    reduceBlood(number = 1) {
        this.currentBlood = this.currentBlood - number;
        if (this.currentBlood <= 0) {
            this.generateNewRoundQiuTaoResponses(this);
        }
    }

    addBlood(number = 1) {
        this.currentBlood = this.currentBlood + number;
    }

    resetWhenDie() {
        this.cards = [];
        this.pandingSigns = [];
        this.weaponCard = null;
        this.shieldCard = null;
        this.plusHorseCard = null;
        this.minusHorseCard = null;
        this.isTieSuo = false;
    }

    resetWhenMyTurnStarts() {
    }

    resetWhenMyTurnEnds() {
        this.skipDraw = false;
        this.skipPlay = false;
        this.judgedShandian = false;
        this.shaTimes = 0;

        // 可能有判定过但是没有移走的闪电
        this.pandingSigns = this.pandingSigns.map((sign) => {
            sign.isEffect = undefined;
            return sign
        })
    }

    // 弃牌阶段
    needThrow() {
        return this.cards.length > this.currentBlood
    }
}

exports.Player = Player;