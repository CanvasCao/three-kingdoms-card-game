const {setNextPlayEventSkillToSkillResponse} = require("../event/playEvent");
const {setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect} = require("./wuxieUtils");
const {generateWuxieSimultaneousResponseByScroll} = require("./wuxieUtils");
const {getAllHasWuxiePlayers} = require("./playerUtils");
const {setNextDamageEventSkillToSkillResponse} = require("../event/damageEvent");
const {setNextStrikeEventSkillToSkillResponse} = require("../event/strikeEvent");
const {setNextPandingEventSkillToSkillResponse} = require("../event/pandingEvent");

const tryFindNextSkillResponse = (gameStatus) => {
    if (gameStatus.shanResponse ||
        gameStatus.skillResponse ||
        gameStatus.taoResponses.length > 0 ||
        gameStatus.wuxieSimultaneousResponse.hasWuxiePlayerIds.length > 0
        // gameStatus.scrollResponses.length > 0 || // 结算万箭齐发和南蛮入侵过程中 会放技能
    ) {
        return;
    }

    // 响应判定技能后
    if (gameStatus.pandingEvent) {
        setNextPandingEventSkillToSkillResponse(gameStatus)
        if (gameStatus.skillResponse) {
            return;
        }
    }

    if (gameStatus.damageEvent) {
        setNextDamageEventSkillToSkillResponse(gameStatus)
        if (gameStatus.skillResponse) {
            return;
        }
    }

    if (gameStatus.playEvents) {
        setNextPlayEventSkillToSkillResponse(gameStatus)
        if (gameStatus.skillResponse) {
            return;
        }
    }

    if (gameStatus.useStrikeEvents) {
        setNextStrikeEventSkillToSkillResponse(gameStatus)
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
    if (gameStatus.shanResponse ||
        gameStatus.skillResponse ||
        gameStatus.taoResponses.length > 0 ||
        gameStatus.wuxieSimultaneousResponse.hasWuxiePlayerIds.length > 0
        // gameStatus.scrollResponses.length > 0 ||
    ) {
        return;
    }
    // 无懈可击失效以后 下一个人的锦囊需要继续求无懈可击
    if (gameStatus.scrollResponses.length > 0 && gameStatus.scrollResponses[0].isEffect === undefined) {
        const hasWuxiePlayers = getAllHasWuxiePlayers(gameStatus)
        if (hasWuxiePlayers.length > 0) {
            generateWuxieSimultaneousResponseByScroll(gameStatus)
        } else { // 没人有无懈可击直接生效
            setGameStatusAfterMakeSureNoBodyWantsPlayXuxieThenScrollTakeEffect(gameStatus, gameStatus.scrollResponses[0].actualCard.key);
        }
    }
};

exports.tryFindNextSkillResponse = tryFindNextSkillResponse;
exports.trySettleNextScroll = trySettleNextScroll;