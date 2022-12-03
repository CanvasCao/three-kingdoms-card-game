import { differenceBy } from "lodash/array";
import { GeneralCard } from "../Card/GeneralCards/GeneralCard";
import { MagicCard } from "../Card/StageCards/MagicCards/MagicCard";
import { StageCard } from "../Card/StageCards/StageCard";
import { Game } from "../Game/Game";
import { Role } from "../Role/Role";

export class User {
    game: Game;
    id: string;
    location: number;
    maxBlood: number;
    currentBlood: number;
    private _role: Role;
    generalCard: GeneralCard;
    stageCards: StageCard[];
    pandingCards: MagicCard[];

    set role(r: Role) {
        this._role = r;
        this.maxBlood = r.maxBlood;
    }
    get role() {
        return this._role;
    }

    drawCard(num: number = 1) {
        const cards = this.game.cards.slice(-num);
        this.stageCards.push(...cards);
    }

    useCard(card: StageCard, targets: User[]) {
        card.targets = targets;
        this.game.tableCard = card;
        this.stageCards = differenceBy(this.stageCards, [card], 'cardId');
    };
    
    throwCards(cards: StageCard[]) {
        this.stageCards = differenceBy(this.stageCards, cards, 'cardId');
        this.game.throwedCards.push(...cards);
    }

    reduceBlood(number = 1) {
        this.currentBlood = this.currentBlood - number;
    }

    addBlood(number = 1) {
        this.currentBlood = this.currentBlood + number;
    }

    removePandingCard(card) {
        this.pandingCards = differenceBy(this.pandingCards, [card], 'cardId');
    }

}

exports.User = User;