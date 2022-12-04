import { Tao } from "../Card/StageCards/MagicCards/Tao";
import { Game } from "../Game/Game";
import { User } from "../User/User";
import { Event } from "./Event";

export class QiuTao extends Event {
    game: Game;
    objected = false;
    objectable = true;
    objectionCards: [Tao];
    targets?: User[] | undefined;
    shouldTrigger() {
        return this.game.users.some((user) => {
            return user.currentBlood === 0;
        })
    }
    effect() {
        if (this.objected) {
        }
    }
}