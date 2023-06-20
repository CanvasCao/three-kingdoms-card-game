const ADD_TO_PUBLIC_CARD_TYPE = {
    PLAY: "PLAY",
    PANDING: "PANDING",
    THROW: "THROW",
    CHAI: "CHAI",
    CHANGE_PANDING:"CHANGE_PANDING"
}

const EMIT_TYPE = {
    "REJOIN_ROOM": "rejoin_room",
    "REFRESH_ROOMS": "refresh_rooms",
    "JOIN_ROOM": "join_room",
    "REFRESH_ROOM_PLAYERS": "refresh_room_players",
    "DISCONNECT": "disconnect",

    "INIT": "init",
    "GO_NEXT_STAGE": "go_next_stage",
    "REFRESH_STATUS": "refresh_status",

    "ACTION": "action",
    "RESPONSE": "response",
    "THROW": "throw",
    "CARD_BOARD_ACTION": "card_board_action",
    "WUGU_BOARD_ACTION": "wugu_board_action",

    "NOTIFY_ADD_TO_PLAYER_CARD": "notify_add_to_player_card",
    "NOTIFY_ADD_TO_PUBLIC_CARD": "notify_add_to_public_card",
    "NOTIFY_ADD_LINES": "notify_add_lines"
}

exports.ADD_TO_PUBLIC_CARD_TYPE = ADD_TO_PUBLIC_CARD_TYPE;
exports.EMIT_TYPE = EMIT_TYPE;
