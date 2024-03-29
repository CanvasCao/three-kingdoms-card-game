const {Card} = require("./Card");
const {differenceBy} = require("lodash/array");
const {ACTION} = require("../action/action");

class Player {
    constructor(player) {
        this.heroId = player.heroId;
        this.playerId = player.playerId;
        this.location = player.location;
        this.playerName = player.playerName;
        this.teamMember = player.teamMember;
        this.teamName = player.teamMember.split('-')[0];
        this.memberIndex = player.teamMember.split('-')[1];

        // cards
        this.cards = [];

        // pandingSigns
        this.pandingSigns = [];
        this.weaponCard = null
        this.shieldCard = null
        this.plusHorseCard = null;
        this.minusHorseCard = null;

        // ui tags
        this.isTieSuo = false;

        // delay scroll tags
        this.judgedShandian = false;

        // skip
        this.skipTimimg = {}
        this.skipStage = {};

        // skill
        this.extraDamageMap = {};
        this.givenCardNumber = 0;
        this.useSkillTimes = {};

        // played tags
        this.shaTimes = 0;

        this.isDead = false;
    }

    setPlayerConfig(config) {
        for (const key in config) {
            this[key] = config[key]
        }
        this.currentBlood = process.env.NODE_ENV == 'production' ? config.maxBlood : 2;
        // this.currentBlood = 8;
        // this.maxBlood = 8;
    }

    // Card
    addCards(cards) {
        if (!cards) {
            return
        }
        let addingCards = Array.isArray(cards) ? cards : [cards]
        addingCards = addingCards.map(c => new Card(c))
        this.cards = this.cards.concat(addingCards)
    }

    hasAnyCardsOrPandingCards() {
        return this.hasAnyCards() || this.pandingSigns?.length > 0
    }

    hasAnyCards() {
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

    // blood
    // 只能在damage event调用
    reduceBlood(number = 1) {
        this.currentBlood = this.currentBlood - number;
    }

    addBlood(number = 1) {
        if (this.currentBlood < this.maxBlood) {
            this.currentBlood = this.currentBlood + number;
        }
    }

    resetWhenMyTurnStarts() {
    }

    resetWhenMyTurnEnds() {
        this.skipTimimg = {}
        this.skipStage = {};

        this.shaTimes = 0;

        // 可能有判定过但是没有移走的闪电
        this.judgedShandian = false;
        this.pandingSigns = this.pandingSigns.map((sign) => {
            sign.isEffect = undefined;
            return sign
        })

        this.extraDamageMap = {}; // 许褚
        this.givenCardNumber = 0; // 刘备
        this.useSkillTimes = {}; // 孙权
    }

    // 弃牌阶段
    needThrow() {
        return this.cards.length > this.currentBlood
    }

    // skill
    addUseSkillTimes(skillKey) {
        if (this.useSkillTimes[skillKey]) {
            this.useSkillTimes[skillKey]++
        } else {
            this.useSkillTimes[skillKey] = 1
        }
    }

    // after die
    resetHero(gameStatus) {
        const needThrowCards = [
            ...this.cards,
            this.weaponCard,
            this.shieldCard,
            this.plusHorseCard,
            this.minusHorseCard,
            ...this.pandingSigns.map((sign) => sign.actualCard),
        ].filter(x => !!x)

        ACTION.throw(gameStatus, gameStatus.players[this.playerId], needThrowCards)
        this.isTieSuo = false;
    }
}

exports.Player = Player;