const {throwCards} = require("../utils/cardUtils")
const dieHandler = {
    setStatusWhenUserDie(gameStatus, user) {
        user.isDead = true;
        let needThrowCards = [
            ...user.cards,
            user.weaponCard,
            user.shieldCard,
            user.plusHorseCard,
            user.minusHorseCard,
            ...user.pandingCards,
        ];
        needThrowCards = needThrowCards.filter(x => !!x)
        throwCards(gameStatus, needThrowCards);
        user.resetWhenDie();

        // 之后如果还需要出闪也不用出了
        gameStatus.shanResStages = gameStatus.shanResStages.filter((rs) => rs.originId !== user.userId)
    }
}

exports.dieHandler = dieHandler;