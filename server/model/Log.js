// {
//     [roundPlayer: string]: {
//     [playerId: string]: {
//         use: Card[],
//         play: Card[],
//         }
//     }
// }

const USE_OR_PLAY_CONFIG = {
    USE: "USE",
    PLAY: "PLAY"
}

class Log {
    constructor() {
    }

    addLog({roundNumber, whoseRoundId, playerId, addType, card}) {
        if (!card) {
            return
        }

        const roundPlayer = `${roundNumber}-${whoseRoundId}`
        if (!this?.[roundPlayer]) {
            this[roundPlayer] = {}
        }

        if (!this[roundPlayer]?.[playerId]) {
            this[roundPlayer][playerId] = {
                USE: [],
                PLAY: [],
            }
        }

        this[roundPlayer][playerId][addType].push(card)
    }

    hasUsedOrPlayed({roundNumber, whoseRoundId, playerId, cardKey}) {
        const roundPlayer = `${roundNumber}-${whoseRoundId}`
        const playerLog = this?.[roundPlayer]?.[playerId]
        const used = playerLog?.USE?.find((card) => card.key == cardKey)
        const played = playerLog?.PLAY?.find((card) => card.key == cardKey)
        return used || played;
    }
}

exports.Log = Log;
exports.USE_OR_PLAY_CONFIG = USE_OR_PLAY_CONFIG;
