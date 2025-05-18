/**
 * 海澜之家小程序 - 底部 - 游戏
 * {
 *    "union_id": "oHds-xxxxxxxxxxx",   <--- 只要这个值即可
 *    "invite_user_id": ""
 * }
 * 填写示例：
 * export HLZJ_UNID = 'oHds-xxxxxxxxxxx'
 * 多账号用 & 或换行
 * const $ = new Env('海澜之家-游戏')
 * cron: 39 8,15,20 * * *
 */
const init = require('init')
const {$, notify, sudojia, checkUpdate} = init('海澜之家-游戏');
const hlzjList = process.env.HLZJ_UNID ? process.env.HLZJ_UNID.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://gmdevpro.hlzjppgl.cn'
// 请求头
const headers = {
    'Host': 'gmdevpro.hlzjppgl.cn',
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Origin': 'https://gmdevpro.hlzjppgl.cn',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
};

!(async () => {
    await checkUpdate($.name, hlzjList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < hlzjList.length; i++) {
        const index = i + 1;
        $.unionId = hlzjList[i];
        headers.Referer = `https://gmdevpro.hlzjppgl.cn/?token=${$.unionId}&timestamp=${Date.now()}`;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await main();
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await getUserInfo();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await getTodayWater();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await getDayList();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    // 浏览15s
    console.log(`开始浏览15s奖励...`);
    await receiveTaskWater(3);
    // 领电力礼包 7-12 14-17 18-22
    console.log('开始领三餐礼包...');
    await receiveTaskWater(7);
    await $.wait(sudojia.getRandomWait(2000, 2500));
    // 答题
    console.log('开始答题...');
    await answerTaskWater();
    await $.wait(sudojia.getRandomWait(1200, 1800));
    await answerTaskWater(1);
    await $.wait(sudojia.getRandomWait(1200, 1800));
    await answerTaskWater(2);
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await joinPower();
    await $.wait(sudojia.getRandomWait(1200, 1800));
    await chooseInvest();
    await $.wait(sudojia.getRandomWait(1200, 1800));
    await receiveInvest();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/server/api/authorized-login`, 'post', headers, {
            "union_id": $.unionId,
            "invite_user_id": "78630"
        });
        if (200 !== data.code) {
            console.error(data.message);
            return;
        }
        headers.Authorization = `Bearer ${data.data.token}`;
        console.log(`${data.data.user_info.nick_name}(${data.data.user_info.user_no})`);
        message += `${data.data.user_info.nick_name}(${data.data.user_info.user_no})\n`;
        $.treeId = data.data.user_info.tree_id;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e.response.data}`);
    }
}

/**
 * 获取签到状态
 *
 * @return {Promise<void>}
 */
async function getDayList() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/server/api/day-list`, 'post', headers);
        if (200 !== data.code) {
            console.error(data.message);
            return;
        }
        if (data.data.day_sign_status) {
            console.log(`今日已签到！`);
            message += `今日已签到！\n\n`;
            return;
        }
        console.log(`开始签到`);
        await $.wait(sudojia.getRandomWait(1000, 1500));
        await signIn();
    } catch (e) {
        console.error(`获取签到状态时发生异常：${e.response.data}`);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function signIn() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/server/api/day-sign`, 'post', headers);
        if (200 !== data.code) {
            console.error(data.message);
            return;
        }
        console.log(`签到成功！电力 X${data.data.water_num}\n已连续签到${data.data.day_sign_list.day_num}天`);
        message += `签到成功！\n已连续签到${data.data.day_sign_list.day_num}天\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e.response.data}`);
    }
}

/**
 * 领取今日电力奖励
 *
 * @return {Promise<void>}
 */
async function getTodayWater() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/server/api/user/get-today-water`, 'post', headers);
        if (200 !== data.code) {
            message += `今日电力奖励已领取！\n`;
            console.error(`领取今日电力奖励失败：${data.message}`);
            return;
        }
        console.log(`已领取今日电力奖励：${data.data.get_water}`);
        console.log(`明日可领${data.data.tomorrow_get_water_num}电力`);
        message += `明日可领${data.data.tomorrow_get_water_num}电力\n`;
    } catch (e) {
        console.error(`领取电力时发生异常：${e.response.data}`);
    }
}

/**
 * 领取水滴(任务列表)
 *
 * @param tid
 * @return {Promise<void>}
 */
async function receiveTaskWater(tid) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/server/api/task/receive-task-water`, 'post', headers, {
            "tid": tid
        });
        if (200 !== data.code) {
            console.error(data.message);
            return;
        }
        if (3 === tid) {
            await $.wait(sudojia.getRandomWait(15000, 15100));
        }
        console.log(`领取成功！电力 X${data.data.add_water}`);
    } catch (e) {
        console.error(`领取水滴时发生异常：${e.response.data}`);
    }
}

/**
 * 答题
 *
 * @param tid
 * @return {Promise<void>}
 */
async function answerTaskWater(tid = 0) {
    try {
        await $.wait(sudojia.getRandomWait(1000, 1500));
        const data = await sudojia.sendRequest(`${baseUrl}/server/api/task/answer-task-water`, 'post', headers, {
            "tid": tid
        });
        await $.wait(sudojia.getRandomWait(1000, 1500));
        if (200 !== data.code) {
            console.error(data.message);
            return;
        }
        console.log(`答题成功，电力 X${data.data.add_water}`);
    } catch (e) {
        console.error(`答题时发生异常：${e.response.data}`);
    }
}

/**
 * 获取新的 treeId 并开启进入下一轮游戏
 *
 * @return {Promise<*|null>}
 */
async function enablePower() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/server/api/authorized-login`, 'post', headers, {
            "union_id": $.unionId,
            "invite_user_id": ""
        });
        if (200 !== data.code) {
            console.error(data.message);
            return;
        }
        return data.data.user_info.tree_id;
    } catch (e) {
        console.error(`获取 treeId 时发生异常：${e.response.data}`);
        return null;
    }
}

/**
 * 加入电力
 *
 * @return {Promise<void>}
 */
async function joinPower() {
    try {
        const initialData = await sudojia.sendRequest(`${baseUrl}/server/api/game/use-power`, 'post', headers, {
            "num": 1,
            "user_tree_id": $.treeId
        });
        if (200 !== initialData.code) {
            return console.error(`加入电力失败：${initialData.message}`);
        }
        // 获取当前电力
        let currentEnergy = initialData.data.info.sy_water;
        // 可加入电力次数
        let remainingJoins = initialData.data.user_tree.send_water;
        while (remainingJoins > 0) {
            await $.wait(sudojia.getRandomWait(1200, 1800));
            const responseData = await sudojia.sendRequest(`${baseUrl}/server/api/game/use-power`, 'post', headers, {
                "num": 1,
                "user_tree_id": $.treeId
            });
            if (309 === initialData.code) {
                // 该轮游戏已完成，重新获取 tree_id
                $.treeId = await enablePower();
            }
            if (200 !== responseData.code) {
                console.error(`加入电力失败：${initialData.message}`);
                break;
            }
            currentEnergy = initialData.data.info.sy_water;
            remainingJoins = responseData.data.user_tree.send_water;
            console.log(`当前电力：${currentEnergy}，可加入电力次数：${remainingJoins}`);
        }
        await $.wait(sudojia.getRandomWait(1000, 1500));
        console.log('开始领取宝箱...');
        await receiveBox();
    } catch (e) {
        console.error(`加入电力时发生异常：${e.response.data}`);
    }
}

/**
 * 领取宝箱
 *
 * @return {Promise<void>}
 */
async function receiveBox() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/server/api/game/receive-box`, 'post', headers);
        if (200 !== data.code) {
            console.error(`领取宝箱失败：${data.message}`);
            return;
        }
        console.log(`领取宝箱成功！电力 X${data.data.add_water}`);
    } catch (e) {
        console.error(`领取宝箱时发生异常：${e.response.data}`);
    }
}

/**
 * 选择投资
 *
 * @returns {Promise<void>}
 */
async function chooseInvest() {
    try {
        console.log('开始投资任务，默认选择最小投资');
        const data = await sudojia.sendRequest(`${baseUrl}/server/api/power/choose-invest`, 'post', headers, {
            "condition": "min"
        });
        if (200 !== data.code) {
            console.error(`选择投资失败：${data.message}`);
            return;
        }
        console.log('选择最小投资成功');
    } catch (e) {
        console.error(`选择投资时发生异常：${e.response.data}`);
    }
}

/**
 * 领取投资
 *
 * @returns {Promise<void>}
 */
async function receiveInvest() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/server/api/power/receive-invest`, 'post', headers);
        if (200 !== data.code) {
            console.error(`领取投资失败：${data.message}`);
            return;
        }
        console.log(`领取投资成功！获得电力X${data.data.add_power_num}`);
    } catch (e) {
        console.error(`领取投资时发生异常：${e.response.data}`);
    }
}
