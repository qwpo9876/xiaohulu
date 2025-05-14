/*
 * 海澜之家小程序 - 底部 - 游戏
 * {
 *   "union_id": "oHds-xxxxxxxxxxx",   <--- 只需此值
 *   "invite_user_id": ""
 * }
 * 填写示例：
 * export HLZJ_UNID='oHds-xxxxxxxxxxx'
 * 多账号用 & 或换行
 * const $ = new Env('海澜之家-游戏')
 * cron: 39 8,15,20 * * *
 */

const init = require('init');
const { $, notify, sudojia, checkUpdate } = require('init')('海澜之家-游戏');
const hlzjList = process.env.HLZJ_UNID ? process.env.HLZJ_UNID.split(/[\n&]/) : [];
let message = '';

// 接口配置
const baseUrl = 'https://gmdevpro.hlzjppgl.cn';
const headers = {
    'Host': 'gmdevpro.hlzjppgl.cn',
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Origin': 'https://gmdevpro.hlzjppgl.cn',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9'
};

!(async () => {
    await checkUpdate($.name, hlzjList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['User-Agent']}`);
    
    for (let i = 0; i < hlzjList.length; i++) {
        const index = i + 1;
        $.unionId = hlzjList[i];
        headers.Referer = `https://gmdevpro.hlzjppgl.cn/?token=${$.unionId}&timestamp=${Date.now()}`;
        
        console.log(`\n***** 第[${index}]个${$.name}账号 *****`);
        message += `📣==== ${$.name}账号[${index}] ====📣\n`;
        
        await main();
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    
    if (message) {
        await notify.sendNotify(`「${$.name}」`, message);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

/**
 * 主任务流程
 */
async function main() {
    await getUserInfo();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    
    await getTodayWater();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    
    await getDayList();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    
    // 浏览15s任务
    console.log('开始浏览15s奖励...');
    await receiveTaskWater(3);
    
    // 三餐礼包（7-12 14-17 18-22）
    console.log('开始领取三餐礼包...');
    await receiveTaskWater(7);
    await $.wait(sudojia.getRandomWait(2000, 2500));
    
    // 答题任务
    console.log('开始答题...');
    await answerTaskWater();
    await $.wait(sudojia.getRandomWait(1200, 1800));
    await answerTaskWater(1);
    await $.wait(sudojia.getRandomWait(1200, 1800));
    await answerTaskWater(2);
    await $.wait(sudojia.getRandomWait(2000, 2500));
    
    await joinPower();
    await $.wait(sudojia.getRandomWait(1200, 1800));
    
    await chooseInvest();
    await $.wait(sudojia.getRandomWait(1200, 1800));
    
    await receiveInvest();
}

/**
 * 获取用户信息
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(
            `${baseUrl}/server/api/authorized-login`,
            'post',
            headers,
            { "union_id": $.unionId, "invite_user_id": "" }
        );
        
        if (data.code !== 200) {
            console.error(data.message);
            return;
        }
        
        headers.Authorization = `Bearer ${data.data.token}`;
        console.log(`${data.data.user_info.nick_name}(${data.data.user_info.user_no})`);
        message += `${data.data.user_info.nick_name}(${data.data.user_info.user_no})\n`;
        $.treeId = data.data.user_info.tree_id;
    } catch (e) {
        console.error(`获取用户信息异常：${e.response?.data || e.message}`);
    }
}

/**
 * 获取今日电力奖励
 */
async function getTodayWater() {
    try {
        const data = await sudojia.sendRequest(
            `${baseUrl}/server/api/user/get-today-water`,
            'post',
            headers
        );
        
        if (data.code !== 200) {
            message += `今日电力奖励已领取！\n`;
            console.error(`领取失败：${data.message}`);
            return;
        }
        
        console.log(`已领取今日电力：${data.data.get_water}`);
        console.log(`明日可领电力：${data.data.tomorrow_get_water_num}`);
        message += `明日可领电力：${data.data.tomorrow_get_water_num}\n`;
    } catch (e) {
        console.error(`领取电力异常：${e.response?.data || e.message}`);
    }
}
