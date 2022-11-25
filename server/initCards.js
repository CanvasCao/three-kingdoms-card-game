const {v4: uuidv4} = require('uuid');
const {shuffle} = require('./utils/utils');

let cardList = [
    {'huase': '♣️', number: 1, name: "诸葛连弩", chineseName: '诸葛连弩',},
    {'huase': '♦️', number: 1, name: "诸葛连弩", chineseName: '诸葛连弩'},
    {'huase': '♠️️', number: 1, name: "闪电", chineseName: '闪电'},
    {'huase': '♥️', number: 1, name: "桃园结义", chineseName: '桃园结义'},

    {'huase': '♣️', number: 2, name: "八卦阵", chineseName: '诸葛连弩'},
    {'huase': '♦️', number: 2, name: "闪", chineseName: '闪'},
    {'huase': '♠️️', number: 2, name: "八卦阵", chineseName: '闪电'},
    {'huase': '♥️', number: 2, name: "闪", chineseName: '闪'},
]

let testCardList = [
    {'huase': '♠️️', number: 1, name: "杀", chineseName: '杀', englishName: 'strike'},
    {'huase': '♦️', number: 2, name: "闪", chineseName: '闪', englishName: 'dodge'},
    {'huase': '️♥️', number: 3, name: "桃", chineseName: '桃', englishName: 'peach'},
]

const getInitCards = () => {
    return shuffle(testCardList.map(c => {
        c.cardId = uuidv4();
        return c
    }))
}

exports.getInitCards = getInitCards;