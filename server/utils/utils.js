const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

const generateBehaviorMessage = (behavior, users) => {
    // {
    //     "cards": [],
    //     "actualCard": {},
    //     "originId": "22c3d181-5d60-4283-a4ce-6f2b14d772bc",
    //     "targetId": "22c3d181-5d60-4283-a4ce-6f2b14d772bc"
    //     "actions": [{
    //     "originId": "22c3d181-5d60-4283-a4ce-6f2b14d772bc",
    //     "targetId": "user2",
    //     }]
    // }
    const targetName = behavior.actions ? behavior.actions.map((a) => users[a.targetId].name).join(' ') : users?.[behavior?.targetId]?.name
    const originName = behavior.actions ? users[behavior.actions[0].originId].name : users[behavior.originId].name;

    return targetName?`${originName}对${targetName}使用了${behavior.actualCard.CN}`:`${originName}使用了${behavior.actualCard.CN}`
}

exports.shuffle = shuffle;
exports.generateBehaviorMessage = generateBehaviorMessage;