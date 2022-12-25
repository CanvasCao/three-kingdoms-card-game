const {
    generateTieSuoTempStorageByShaAction,
    setGameStatusByTieSuoTempStorage
} = require("../utils/tieSuoUtils");

const {clearNextScrollStage, clearWuxieResStage, clearNextShanStage, clearNextTaoStage} = require("../utils/stageUtils");
const {BASIC_CARDS_CONFIG, SCROLL_CARDS_CONFIG} = require("../initCards")
const {throwCards, getCards} = require("../utils/cardUtils")
const {tryGoNextStage} = require("../utils/stageUtils")
const {getAllHasWuxieUsers, getCurrentUser} = require("../utils/userUtils")
const {getNextNeedExecutePandingSign} = require("../utils/pandingUtils")
const {dieHandler} = require("../handler/dieHandler")

const responseHandler = {
    setStatusByTaoResponse: (gameStatus, response) => {
        const curTaoResStage = gameStatus.taoResStages[0];
        const originUser = gameStatus.users[curTaoResStage.originId];
        const targetUser = gameStatus.users[curTaoResStage.targetId];

        if (response?.actualCard?.CN == BASIC_CARDS_CONFIG.TAO.CN) { // 出桃了
            originUser.removeCards(response.cards);
            throwCards(gameStatus, response.cards);

            targetUser.addBlood();

            if (targetUser.currentBlood > 0) { // 出桃复活 不需要任何人再出桃
                gameStatus.taoResStages = [];
                setGameStatusByTieSuoTempStorage(gameStatus);
            } else { // 出桃还没复活 更新需要下一个人提示的出桃的数量
                gameStatus.taoResStages.forEach((rs) => {
                    rs.cardNumber = 1 - targetUser.currentBlood;
                })
            }
        } else {
            // 没出桃 下一个人求桃
            clearNextTaoStage(gameStatus);

            // 没有任何人出桃 当前角色死亡
            if (gameStatus.taoResStages.length == 0) {
                dieHandler.setStatusWhenUserDie(gameStatus, targetUser);
                setGameStatusByTieSuoTempStorage(gameStatus);
            }
        }
        //闪电求桃之后 需要判断是不是从判定阶段到出牌阶段
        tryGoNextStage(gameStatus);
    },

    setStatusByShanResponse: (gameStatus, response) => {
        const curShanResStage = gameStatus.shanResStages[0];
        const originUser = gameStatus.users[curShanResStage.originId];

        if (response?.actualCard?.CN == BASIC_CARDS_CONFIG.SHAN.CN) { // 出闪了
            originUser.removeCards(response.cards);
            throwCards(gameStatus, response.cards);

            curShanResStage.cardNumber--; // 吕布需要两个杀
            if (curShanResStage.cardNumber == 0) {
                clearNextShanStage(gameStatus);
            } else {
                // do nothing
            }
        } else { // 没出闪
            clearNextShanStage(gameStatus);

            originUser.reduceBlood();
            generateTieSuoTempStorageByShaAction(gameStatus); // 只有第一个中铁锁连环且不出闪的 会运行

            // <0 setGameStatusByTieSuoTempStorage的逻辑在求桃之后
            // 如果我还活着需要立刻结算下一个人的铁锁连环
            if (originUser.currentBlood > 0) {
                setGameStatusByTieSuoTempStorage(gameStatus);
            }
        }
    },

    setStatusByWuxieResponse: (gameStatus, response) => {
        let hasWuxiePlayerIds = gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds;
        let wuxieChain = gameStatus.wuxieSimultaneousResStage.wuxieChain;
        const originUser = gameStatus.users[response.originId];

        // EmitResponseData = {
        //     cards: Card[],
        //     actualCard: Card,
        //     originId: string,
        //     targetId: string,
        //     wuxieTargetCardId?: string,
        // }

        // 锦囊
        // 出无懈可击了
        // 1 校验chain 如果已通过 用户打出
        // 1.1 如果没人有无懈 清空wuxieResStage 锦囊生效
        // 1.2 如果还有人有无懈 更新hasWuxiePlayerIds/wuxieChain 前端强制等待三秒
        // 2 如果不通过 用户不会打出

        // 不出无懈可击
        // 从hasWuxiePlayerIds移除
        // 如果 如果没人有无懈 清空wuxieResStage 锦囊生效
        // 否则 如果还有人有无懈 继续等待

        // 延时锦囊生效之后 set pandingSigns isEffect true/false 给executeNextOnePanding执行
        // 即时锦囊生效 set scrollResStages isEffect true 或 clear scrollResStages

        if (response?.actualCard?.CN == SCROLL_CARDS_CONFIG.WU_XIE_KE_JI.CN) { // 出无懈可击了
            const lastWuxieChainItem = wuxieChain[wuxieChain.length - 1];
            const validatedChainResponse = lastWuxieChainItem.actualCard.cardId === response.wuxieTargetCardId;

            if (validatedChainResponse) {
                originUser.removeCards(response.cards);
                const hasWuxiePlayers = getAllHasWuxieUsers(gameStatus);
                gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds = hasWuxiePlayers.map(u => u.userId);

                if (hasWuxiePlayers.length == 0) {
                    // 锦囊开始结算
                } else {
                    gameStatus.wuxieSimultaneousResStage.wuxieChain.push({
                        cards: response.cards,
                        actualCard: response.actualCard,
                        originId: response.originId,
                        targetId: response.targetId,
                        wuxieTargetCardId: response.wuxieTargetCardId,
                    });
                    // EMIT.FORCEWAIT()
                }
            }
        } else { // 没出无懈可击
            gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds = hasWuxiePlayerIds.filter((id) => id !== response.originId)
            if (gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds.length == 0) {
                // 锦囊开始结算
            }
        }

        // 没有人有无懈可击 wuxieChain长度为奇数个 锦囊生效
        if (gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds.length == 0) { // 生效/失效

            const isScrollEffected = (gameStatus.wuxieSimultaneousResStage.wuxieChain.length % 2 == 1)
            // 延时锦囊
            if (gameStatus.stage.stageName == "judge") {
                const nextNeedPandingSign = getNextNeedExecutePandingSign(gameStatus);
                nextNeedPandingSign.isEffect = isScrollEffected;

                // 延时锦囊生效/失效 开始执行判定
                tryGoNextStage(gameStatus);
            }
            // 即时锦囊
            else if (gameStatus.scrollResStages.length > 0) {
                if (isScrollEffected) {// 生效
                    if (gameStatus.scrollResStages[0].actualCard.CN == SCROLL_CARDS_CONFIG.WU_ZHONG_SHENG_YOU.CN) {
                        getCurrentUser(gameStatus).addCards(getCards(gameStatus, 2));
                        clearNextScrollStage(gameStatus);
                    } else {
                        gameStatus.scrollResStages[0].isEffect = true;
                    }
                } else {// 失效
                    clearNextScrollStage(gameStatus);
                }
            }
            clearWuxieResStage(gameStatus); // 生效后清空WuxieResStage
        }
    }
}

exports.responseHandler = responseHandler;