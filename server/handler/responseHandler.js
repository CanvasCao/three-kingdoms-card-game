const {BASIC_CARDS_CONFIG} = require("../initCards")
const {throwCards} = require("../utils/cardUtils")
const responseHandler = {
    setStatusByTaoResponse: (gameStatus, response, setStateByTieSuoTempStorage, setStatusWhenUserDie, stageUtils) => {
        const curTaoResStage = gameStatus.taoResStages[0];
        const originUser = gameStatus.users[curTaoResStage.originId];
        const targetUser = gameStatus.users[curTaoResStage.targetId];

        if (response?.actualCard?.CN == BASIC_CARDS_CONFIG.TAO.CN) { // 出桃了
            originUser.removeCards(response.cards);
            throwCards(gameStatus,response.cards);

            targetUser.addBlood();

            if (targetUser.currentBlood > 0) { // 出桃复活 不需要任何人再出桃
                gameStatus.taoResStages = [];
                setStateByTieSuoTempStorage();
            } else { // 出桃还没复活 更新需要下一个人提示的出桃的数量
                gameStatus.taoResStages.forEach((rs) => {
                    rs.cardNumber = 1 - targetUser.currentBlood;
                })
            }
        } else {
            // 没出桃 下一个人求桃
            gameStatus.taoResStages.shift();

            // 没有任何人出桃 当前角色死亡
            if (gameStatus.taoResStages.length == 0) {
                setStatusWhenUserDie(targetUser);// TODO 需要过滤掉shan response里面的tar
                setStateByTieSuoTempStorage();
            }
        }
        //闪电求桃之后 需要判断是不是从判定阶段到出牌阶段
        stageUtils.tryGoNextStage();
    },

    setStatusByShanResponse: (gameStatus, response, generateTieSuoTempStorageByShaAction, setStateByTieSuoTempStorage) => {
        const curShanResStage = gameStatus.shanResStages[0];
        const originUser = gameStatus.users[curShanResStage.originId];

        if (response?.actualCard?.CN == BASIC_CARDS_CONFIG.SHAN.CN) { // 出闪了
            originUser.removeCards(response.cards);
            throwCards(gameStatus,response.cards);

            curShanResStage.cardNumber--; // 吕布需要两个杀
            if (curShanResStage.cardNumber == 0) {
                gameStatus.shanResStages.shift();
            } else {
                // do nothing
            }
        } else { // 没出闪
            gameStatus.shanResStages.shift();

            originUser.reduceBlood();
            generateTieSuoTempStorageByShaAction(); // 只有第一个中铁锁连环且不出闪的 会运行

            // <0 setStateByTieSuoTempStorage的逻辑在求桃之后
            // 如果我还活着需要立刻结算下一个人的铁锁连环
            if (originUser.currentBlood > 0) {
                setStateByTieSuoTempStorage();
            }
        }
    },
}

exports.responseHandler = responseHandler;