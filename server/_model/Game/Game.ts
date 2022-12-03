import { StageCard } from "../Card/StageCards/StageCard";
import { User } from "../User/User";

enum Stage {
    USER,
    SYSTEM,
}

export class Game {
    users: User[] = [];
    round: number = 0;
    currentLocation: number = 0;
    _currentUser: User;
    cards: StageCard[] = [];
    _tableCard: StageCard;
    throwedCards: StageCard[] = [];
    stage: Stage = Stage.SYSTEM;

    set currentUser(user: User) {
        this._currentUser = user;
        this.stage = Stage.USER;
    }

    set tableCard(_card: StageCard) {
        if (_card) {
            this.stage = Stage.SYSTEM;
            this._tableCard = _card;
            _card.preEffect(this);
        } else {
            this._tableCard.effect();
        }
    }
    get tableCard() {
        return this._tableCard;
    }


}
