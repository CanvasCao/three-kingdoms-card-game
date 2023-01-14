const {Card} = require("./Card");
const {differenceBy} = require("lodash/array");
const {v4: uuidv4} = require('uuid');

class Player {
    constructor(player, generateNewRoundQiuTaoResponseStages) {
        this.maxBlood = 4;
        this.currentBlood = 3 || this.maxBlood;
        this.shaLimitTimes = 1;
        this.imageName = player.imageName;
        this.playerId = player.playerId;
        this.name = player.name;
        this.location = player.location;

        // cards
        this.cards = [];

        // pandingSigns
        this.pandingSigns = [];
        this.weaponCard = {
            "huase": "♣️",
            "number": 1,
            "key": "ZHU_GE_LIAN_NU",
            "KEY": "ZHU_GE_LIAN_NU",
            "cardId": uuidv4(),
            "cardNumDesc": "A",
            "CN": "方天画戟",
            "EN": "Crossbow",
            "type": "EQUIPMENT",
            "equipmentType": "WEAPON",
            "distance": 4,
            "distanceDesc": "一",
            "canClickMySelfAsFirstTarget": false,
            "canClickMySelfAsSecondTarget": false,
            "canPlayInMyTurn": true,
            "targetMinMax": {
                "min": 0,
                "max": 0
            },
            "noNeedSetTargetDueToImDefaultTarget": true
        };
        this.shieldCard = null;
        this.plusHorseCard = null;
        this.minusHorseCard = null;

        // ui tags
        this.isTieSuo = true;

        // delay scroll tags
        this.judgedShandian = false;
        this.skipDraw = false;
        this.skipPlay = false;

        // played tags
        this.shaTimes = 0;

        // skills
        this.skills = [
            {triggerStage: '', name: ''},
        ]

        this.isDead = false

        // 耦合 掉血和求桃
        this.generateNewRoundQiuTaoResponseStages = generateNewRoundQiuTaoResponseStages;

        // tun
    }

    addCards(cards) {
        let addingCards = Array.isArray(cards) ? cards : [cards]
        addingCards = addingCards.map(c => new Card(c))
        this.cards = this.cards.concat(addingCards)
    }

    removeHandCards(cards) {
        let removingCards = Array.isArray(cards) ? cards : [cards]
        this.cards = differenceBy(this.cards, removingCards, 'cardId');
    }

    removeCards(cards) {
        this.removeHandCards(cards)
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
            this.generateNewRoundQiuTaoResponseStages(this);
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