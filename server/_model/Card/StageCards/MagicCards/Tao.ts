import { User } from "../../../User/User";
import { MagicCard } from "./MagicCard";

export class Tao implements MagicCard {
    name = "Tao"
    nameCN = "桃"
    effect(users?: User[]) {
        users?.forEach((user) => {
            user.currentBlood ++;
        })
    }
}