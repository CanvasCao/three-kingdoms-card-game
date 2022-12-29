import { Tao } from "../Card/StageCards/MagicCards/Tao";
import { Game } from "../Game/Game";
import { Player } from "../Player/Player";
import { Event } from "./Event";

export class QiuTao extends Event {
    game: Game;
    objected = false;
    objectable = true;
    objectionCards: [Tao];
    targets?: Player[] | undefined;
    shouldTrigger() {
        return this.game.players.some((player) => {
            return player.currentBlood === 0;
        })
    }
    effect() {
        if (this.objected) {
        }
    }
}