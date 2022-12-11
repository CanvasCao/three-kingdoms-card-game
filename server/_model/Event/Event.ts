import { StageCard } from "../Card/StageCards/StageCard";
import { Game, Stage } from "../Game/Game";
import { User } from "../User/User";


export class Event {
    game?: Game;
    objected?: boolean;
    objectable?: boolean;
    objectionCards?: StageCard[];
    targets?: User[];
    shouldTrigger?(): void;
    effect?(users?: User[]):void
    constructor(game: Game, targets?: User[]) {
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