function shuffle(array) {
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

const cardList = [
    {'huase': '♣️', number: 1, name: "诸葛连弩", chineseName: '诸葛连弩'},
    {'huase': '♦️', number: 1, name: "诸葛连弩", chineseName: '诸葛连弩'},
    {'huase': '♠️️', number: 1, name: "闪电", chineseName: '闪电'},
    {'huase': '♥️', number: 1, name: "桃园结义", chineseName: '桃园结义'},

    {'huase': '♣️', number: 2, name: "八卦阵", chineseName: '诸葛连弩'},
    {'huase': '♦️', number: 2, name: "闪", chineseName: '闪'},
    {'huase': '♠️️', number: 2, name: "八卦阵", chineseName: '闪电'},
    {'huase': '♥️', number: 2, name: "闪", chineseName: '闪'},
]
const testCardList = [
    {'huase': '♠️️', number: 9, name: "sha", chineseName: '杀'},
    {'huase': '♦️', number: 2, name: "shan", chineseName: '闪'},
]


const initCards = shuffle(testCardList)

exports.initCards = initCards;