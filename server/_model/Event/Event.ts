import { StageCard } from "../Card/StageCards/StageCard";
import { Game, Stage } from "../Game/Game";
import { Player } from "../Player/Player";


export class Event {
    game?: Game;
    objected?: boolean;
    objectable?: boolean;
    objectionCards?: StageCard[];
    targets?: Player[];
    shouldTrigger?(): void;
    effect?(players?: Player[]):void
    constructor(game: Game, targets?: Player[]) {
        this.game = game;
    }
    start?() {
        if (this.game) {
            this.game.stage = Stage.EVENT;
        }
    }
    end?() {
        if (this.game) {
            this.game.stage = Stage.SYSTEM;
        }
    }
}