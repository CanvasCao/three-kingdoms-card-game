import { StageCard } from "../Card/StageCards/StageCard";
import { Event } from "../Event/Event";
import { QiuTao } from "../Event/QiuTao";
import { User } from "../User/User";

export enum Stage {
    USER, // 当前轮的用户可出牌的阶段
    EVENT, // 事件阶段持续到所有目标用户被移除
    SYSTEM, // 系统响应阶段
}

export class Game {
    users: User[] = [];
    round: number = 0;
    currentLocation: number = 0;
    currentUser: User;
    cards: StageCard[] = [];
    _tableCard: StageCard;
    throwedCards: StageCard[] = [];
    _stage: Stage = Stage.SYSTEM;
    systemEvents: Event[] = [];
    currentEvents: Event[] = [];
    currentEvent: Event;

    set tableCard(_card: StageCard) {
        if (_card) {
            this.stage = Stage.EVENT;
        }
        this._tableCard = _card;
    }
    get tableCard() {
        return this._tableCard;
    }

    set stage(_stage: Stage) {
        this._stage = _stage;
        this.judgement()
    }
    get stage() {
        return this._stage;
    }

    constructor() {
        this.systemEvents = [new QiuTao(this)];
    }

    onCardEffect() {
        this.systemEvents.forEach((event) => {
            if (event.shouldTrigger?.()) {
                this.currentEvents.push(event);
            }
        });
        if (this.currentEvents.length > 0) {
            this.stage = Stage.EVENT;
        }
    }

    start() {}

    goToNextRound() {
        this.round ++;
        this.currentLocation ++;
        this.currentUser = this.users[this.currentLocation];
        this.currentUser.pandingCards?.forEach(card => {
            card.effect?.();
        });
    }

    judgement() {
        if (this.tableCard.targets) {
            while(this.tableCard.targets.length > 0) {
                this.currentUser = this.tableCard.targets[0];
            }
        } else {
            this.tableCard.effect?.(this.users);
        }
    }

}
