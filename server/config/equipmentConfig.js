const {EQUIPMENT_TYPE} = require("./cardConfig");
const EQUIPMENT_MAP = {
    [EQUIPMENT_TYPE.PLUS_HORSE]: "plusHorseCard",
    [EQUIPMENT_TYPE.MINUS_HORSE]: "minusHorseCard",
    [EQUIPMENT_TYPE.WEAPON]: "weaponCard",
    [EQUIPMENT_TYPE.SHIELD]: "shieldCard"
};

exports.EQUIPMENT_MAP = EQUIPMENT_MAP;
