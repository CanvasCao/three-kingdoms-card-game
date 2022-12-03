import { Game } from "../../Game/Game";
import { User } from "../../User/User";
import { Card } from "../Card";

export interface StageCard extends Card {
    targets?: User[];
    preEffect(game: Game): void;
    effect():void
}