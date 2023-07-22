class Card {
    constructor(card) {
        this.huase = card.huase;
        this.number = card.number;
        this.key = card.key;
        this.cardId = card.cardId;
        this.cardNumDesc = card.cardNumDesc;
        this.type = card.type;
        this.attribute = card.attribute;

        this.equipmentType = card.equipmentType;
        this.horseDistance = card.horseDistance;
        this.distance = card.distance;
        this.distanceDesc = card.distanceDesc;
    }
}

exports.Card = Card;