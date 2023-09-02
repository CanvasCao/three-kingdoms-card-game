const teamMembers = ['zhongchen-1', 'zhongchen-2', 'zhongchen-3', 'zhongchen-4', 'fanzei-1', 'fanzei-2', 'fanzei-3', 'fanzei-4'];

const getNextEmptyTeamMemberSlot = (roomPlayers) => {
    for (let i = 0; i < teamMembers.length; i++) {
        if (!roomPlayers.find(roomPlayer => roomPlayer.teamMember == teamMembers[i])) {
            return teamMembers[i]
            break;
        }
    }

}


exports.getNextEmptyTeamMemberSlot = getNextEmptyTeamMemberSlot;
exports.teamMembers = teamMembers;
