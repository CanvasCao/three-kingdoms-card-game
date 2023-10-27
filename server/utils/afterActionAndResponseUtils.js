const {setNextResponseCardEventSkill} = require("../event/responseCardEvent");
const {setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect} = require("./wuxieUtils");
const {generateWuxieSimultaneousResponseByScroll} = require("./wuxieUtils");
const {getAllHasWuxiePlayers} = require("./playerUtils");
const {setNextDamageEventSkill} = require("../event/damageEvent");
const {setNextStrikeEventSkill} = require("../event/strikeEvent");
const {setNextPandingEventSkill} = require("../event/pandingEvent");

const tryFindNextSkillResponse = (gameStatus) => {
    if (gameStatus.cardResponse ||
        gameStatus.skillResponse ||
        gameStatus.taoResponses?.length > 0 ||
        gameStatus.cardBoardResponses?.length > 0 ||
        gameStatus.fanjianBoardResponse ||
        gameStatus.wuxieSimultaneousResponse?.hasWuxiePlayerIds?.length > 0
    ) {
        return;
    }

    if (gameStatus.pandingEvent) {
        setNextPandingEventSkill(gameStatus)
        if (gameStatus.skillResponse) {
            return;
        }
    }

    if (gameStatus.damageEvents) {
        setNextDamageEventSkill(gameStatus)
        if (gameStatus.skillResponse) {
            return;
        }
    }

    // responseCardEvents 比 useStrikeEvents 优先
    // 青龙偃月刀 被吕布第一张闪 闪避后 会继续要求第二张闪
    if (gameStatus.responseCardEvents) {
        setNextResponseCardEventSkill(gameStatus)
        if (gameStatus.cardResponse || gameStatus.skillResponse) {
            return;
        }
    }

    if (gameStatus.useStrikeEvents) {
        setNextStrikeEventSkill(gameStatus)
        if (gameStatus.skillResponse) {
            return;
        }
    }

    // TODO 其他铁锁连环角色受到伤害
    // if (gameStatus.tieSuoTempStorage.length) {
    //     setGameStatusByTieSuoTempStorage(gameStatus);
    //     if (gameStatus.taoResponses.length) {
    //         return;
    //     }
    // }
}


// event的优先级 高于结算锦囊
const trySettleNextScroll = (gameStatus) => {
    if (gameStatus.cardResponse ||
        gameStatus.skillResponse ||
        gameStatus.taoResponses.length > 0 ||
        gameStatus.cardBoardResponses.length > 0 ||
        gameStatus.fanjianBoardResponse ||
        gameStatus.wuxieSimultaneousResponse.hasWuxiePlayerIds.length > 0
    ) {
        return;
    }
    // 下一个人的锦囊需要继续求无懈可击
    if (gameStatus.scrollStorages.length > 0 && gameStatus.scrollStorages[0].isEffect === undefined) {
        const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus)
        if (hasWuxiePlayers.length > 0) {
            generateWuxieSimultaneousResponseByScroll(gameStatus)
        } else {
            setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, gameStatus.scrollStorages[0].actualCard.key);
        }
    }
};

exports.tryFindNextSkillResponse = tryFindNextSkillResponse;
exports.trySettleNextScroll = trySettleNextScroll;