import { Player } from "../../../Player/Player";
import { MagicCard } from "./MagicCard";

export class Tao implements MagicCard {
    name = "Tao"
    nameCN = "桃"
    effect(players?: Player[]) {
        players?.forEach((player) => {
            player.currentBlood ++;
        })
    }
}