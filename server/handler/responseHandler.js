const {cloneDeep} = require("lodash");
const {
    setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect,
    resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie
} = require("../utils/wuxieUtils");
const {
    generateTieSuoTempStorageByShaAction,
    setGameStatusByTieSuoTempStorage
} = require("../utils/tieSuoUtils");
const {clearNextShanStage, clearNextTaoStage, clearNextScrollStage} = require("../utils/clearStageUtils");
const {BASIC_CARDS_CONFIG, SCROLL_CARDS_CONFIG} = require("../initCards")
const {throwCards} = require("../utils/cardUtils")
const {getAllHasWuxiePlayers, getCurrentPlayer} = require("../utils/playerUtils")
const {dieHandler} = require("../handler/dieHandler")
const {emitNotifyJieDaoWeaponOwnerChange} = require("../utils/emitUtils")

const responseCardHandler = {
    setStatusByTaoResponse: (gameStatus, response) => {
        const curTaoResStage = gameStatus.taoResStages[0];
        const originPlayer = gameStatus.players[curTaoResStage.originId];
        const targetPlayer = gameStatus.players[curTaoResStage.targetId];

        if (response?.actualCard?.CN == BASIC_CARDS_CONFIG.TAO.CN) { // 出桃了
            originPlayer.removeHandCards(response.cards);
            throwCards(gameStatus, response.cards);

            targetPlayer.addBlood();

            if (targetPlayer.currentBlood > 0) { // 出桃复活 不需要任何人再出桃
                gameStatus.taoResStages = [];
                setGameStatusByTieSuoTempStorage(gameStatus);
            } else { // 出桃还没复活 更新需要下一个人提示的出桃的数量
                gameStatus.taoResStages.forEach((rs) => {
                    rs.cardNumber = 1 - targetPlayer.currentBlood;
                })
            }
        } else {
            // 没出桃 下一个人求桃
            clearNextTaoStage(gameStatus);

            // 没有任何人出桃 当前角色死亡
            if (gameStatus.taoResStages.length == 0) {
                dieHandler.setStatusWhenPlayerDie(gameStatus, targetPlayer);
                setGameStatusByTieSuoTempStorage(gameStatus);
            }
        }
    },

    setStatusByShanResponse: (gameStatus, response) => {
        const curShanResStage = gameStatus.shanResStages[0];
        const originPlayer = gameStatus.players[curShanResStage.originId];

        if (response?.actualCard?.CN == BASIC_CARDS_CONFIG.SHAN.CN) { // 出闪了
            originPlayer.removeHandCards(response.cards);
            throwCards(gameStatus, response.cards);

            curShanResStage.cardNumber--; // 吕布需要两个杀
            if (curShanResStage.cardNumber == 0) {
                clearNextShanStage(gameStatus);
            } else {
                // do nothing
            }
        } else { // 没出闪
            clearNextShanStage(gameStatus);

            originPlayer.reduceBlood();
            generateTieSuoTempStorageByShaAction(gameStatus); // 只有第一个中铁锁连环且不出闪的 会运行

            // <0 setGameStatusByTieSuoTempStorage的逻辑在求桃之后
            // 如果我还活着需要立刻结算下一个人的铁锁连环
            if (originPlayer.currentBlood > 0) {
                setGameStatusByTieSuoTempStorage(gameStatus);
            }
        }
    },

    setStatusByWuxieResponse: (gameStatus, response) => {
        let hasWuxiePlayerIds = gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds;
        let wuxieChain = gameStatus.wuxieSimultaneousResStage.wuxieChain;
        const originPlayer = gameStatus.players[response.originId];

        // EmitResponseData = {
        //     cards: Card[],
        //     actualCard: Card,
        //     originId: string,
        //     targetId: string,
        //     wuxieTargetCardId?: string,
        // }

        // 锦囊
        // 出无懈可击了
        // 1 校验chain 如果已通过 用户打出 更新hasWuxiePlayerIds/wuxieChain
        // 1.1 如果没人有无懈 清空wuxieResStage 锦囊生效
        // 1.2 如果还有人有无懈 前端强制等待三秒
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
                originPlayer.removeHandCards(response.cards);
                resetHasWuxiePlayerIdsAndPushChainAfterValidatedWuxie(gameStatus, response);
                const newHasWuxiePlayers = getAllHasWuxiePlayers(gameStatus);
                if (newHasWuxiePlayers.length == 0) {
                    // 锦囊开始结算
                    setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, "setStatusByWuxieResponse");
                } else {
                    // EMIT.FORCEWAIT()
                }
            }
        } else { // 没出无懈可击
            const newHasWuxiePlayersIds = hasWuxiePlayerIds.filter((id) => id !== response.originId);
            gameStatus.wuxieSimultaneousResStage.hasWuxiePlayerIds = newHasWuxiePlayersIds;
            if (newHasWuxiePlayersIds.length == 0) {
                // 锦囊开始结算
                setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, "setStatusByWuxieResponse")
            }
        }
    },

    setStatusByNanManOrWanJianResponse: (gameStatus, response) => {
        const originPlayer = gameStatus.players[response.originId];

        if (response?.actualCard) {
            clearNextScrollStage(gameStatus);
            originPlayer.removeHandCards(response.cards);
        } else {
            clearNextScrollStage(gameStatus);
            originPlayer.reduceBlood();
        }

        if (gameStatus.scrollResStages.length > 0) {
            const newHasWuxiePlayers = getAllHasWuxiePlayers(gameStatus);
            if (newHasWuxiePlayers.length == 0) {
                setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, "setStatusByNanManResponse");
            } else {
                generateWuxieSimultaneousResStageByScroll(gameStatus)
            }
        }
    },

    setStatusByJueDouResponse: (gameStatus, response) => {
        if (response?.actualCard) {
            const curScrollResStage = gameStatus.scrollResStages[0];
            gameStatus.players[curScrollResStage.originId].removeHandCards(response.cards);

            // 决斗出杀之后 需要互换目标
            const oriTargetId = curScrollResStage.targetId;
            const oriOriginId = curScrollResStage.originId;
            curScrollResStage.targetId = oriOriginId;
            curScrollResStage.originId = oriTargetId;
        } else {
            const curScrollResStage = gameStatus.scrollResStages[0];
            gameStatus.players[curScrollResStage.originId].reduceBlood();

            clearNextScrollStage(gameStatus);
        }
    },

    setStatusByJieDaoResponse: (gameStatus, response) => {
        if (response?.actualCard) { // 出杀 A=>B A出杀 B响应闪
            const curScrollResStage = gameStatus.scrollResStages[0];
            const APlayer = gameStatus.players[curScrollResStage.originId]
            const BPlayer = gameStatus.players[curScrollResStage.targetId]
            gameStatus.players[APlayer.playerId].removeHandCards(response.cards);
            gameStatus.shanResStages = [{
                originId: BPlayer.playerId,
                targetId: APlayer.playerId,
                cardNumber: 1,
            }]
        } else {
            // TODO 如果没有杀 自动不出
            // 不出杀 A=>B A不出 A把刀给当前用户
            const curScrollResStage = gameStatus.scrollResStages[0];
            const APlayer = gameStatus.players[curScrollResStage.originId]
            const currentPlayer = getCurrentPlayer(gameStatus);

            const weaponCard = cloneDeep(APlayer.weaponCard);
            APlayer.removeCards(weaponCard)
            currentPlayer.addCards(weaponCard)
            emitNotifyJieDaoWeaponOwnerChange(gameStatus.io,gameStatus.action, weaponCard);
        }
        clearNextScrollStage(gameStatus);
    }
}

exports.responseCardHandler = responseCardHandler;