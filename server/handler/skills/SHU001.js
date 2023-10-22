const {ACTION} = require("../../action/action");

const handleShu001RenDeAction = (gameStatus) => {
    const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;
    const originPlayer = gameStatus.players[originId];
    const targetPlayer = gameStatus.players[targetIds[0]];

    ACTION.give(gameStatus, originPlayer, targetPlayer, cards)

    let prevGivenCardNumber = originPlayer.givenCardNumber;
    const givenCardNumber = prevGivenCardNumber + cards.length;
    if (prevGivenCardNumber < 2 && givenCardNumber >= 2) {
        originPlayer.addBlood()
    }
}

exports.handleShu001RenDeAction = handleShu001RenDeAction;
