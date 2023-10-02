const handleShu001RenDeAction = (gameStatus) => {
    const {cards, actualCard, originId, skillKey, targetIds = []} = gameStatus.action;
    gameStatus.players[targetIds[0]].addCards(cards);

    const originPlayer = gameStatus.players[originId]
    let prevGivenCardNumber = originPlayer.givenCardNumber;
    const givenCardNumber = prevGivenCardNumber + cards.length;
    if (prevGivenCardNumber < 2 && givenCardNumber >= 2) {
        originPlayer.addBlood()
    }
}

exports.handleShu001RenDeAction = handleShu001RenDeAction;
