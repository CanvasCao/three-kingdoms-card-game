const pandingEvent = require("../event/pandingEvent");

const skillHandler = {
    setStatusBySHU006TieJi: (gameStatus, response) => {
        pandingEvent.generatePandingEvent(gameStatus, response.originId)
    },
}

exports.skillHandler = skillHandler;