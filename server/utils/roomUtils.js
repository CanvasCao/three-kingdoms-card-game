const {shuffle} = require("lodash");
const teamMembers = ['zhugong-1', 'zhugong-2', 'zhugong-3', 'zhugong-4', 'neijian-1', 'neijian-2', 'neijian-3', 'neijian-4'];

const reorderRoomPlayers = (roomPlayers) => {
    const zhugongMembers = shuffle(roomPlayers.filter(roomPlayer => roomPlayer.teamMember.startsWith('zhugong')));
    const neijianMembers = shuffle(roomPlayers.filter(roomPlayer => roomPlayer.teamMember.startsWith('neijian')));

    const result = [];
    const maxLength = Math.max(zhugongMembers.length, neijianMembers.length);

    for (let i = 0; i < maxLength; i++) {
        if (i < zhugongMembers.length) {
            result.push(zhugongMembers[i]);
        }
        if (i < neijianMembers.length) {
            result.push(neijianMembers[i]);
        }
    }
    return result;
}

const getNextEmptyTeamMemberSlot = (roomPlayers) => {
    for (let i = 0; i < teamMembers.length; i++) {
        if (!roomPlayers.find(roomPlayer => roomPlayer.teamMember == teamMembers[i])) {
            return teamMembers[i]
            break;
        }
    }

}

exports.teamMembers = teamMembers;
exports.getNextEmptyTeamMemberSlot = getNextEmptyTeamMemberSlot;
exports.reorderRoomPlayers = reorderRoomPlayers;
