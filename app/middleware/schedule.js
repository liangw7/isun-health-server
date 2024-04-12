const schedule = require('node-schedule');
const moment = require('moment');
const Util = require('../utils/util');
const Visit = require('../models/visit');
const User = require('../models/user');
const Schedule = require('../models/schedule');
const cron = require('node-cron');
var wechat = require('../middleware/wechat');
var cfg = require('../../config/common').config;

// *  *  *  *  *  *
// ┬ ┬ ┬ ┬ ┬ ┬
// │ │ │ │ │ |
// │ │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
// │ │ │ │ └───── month (1 - 12)
// │ │ │ └────────── day of month (1 - 31)
// │ │ └─────────────── hour (0 - 23)
// │ └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)
// 6个占位符从左到右分别代表：秒、分、时、日、月、周几


/**
 * name定时名称
 * ruleObj表达式
 * desc任务描述信息，为空得话给个默认值
 * */
function startTimer(name, ruleObj, desc, patientID) {
    console.log('------startTimer---name---'+name);
    console.log('------startTimer---ruleObj---'+ruleObj);
    console.log('------startTimer---desc---'+desc);
    console.log('------startTimer---patientID---'+patientID);
    return new Promise((resolve, reject) => {
        let rule = new schedule.RecurrenceRule();
        if (!ruleObj) {
            console.log('定时任务表达式为空！');
            reject({ code: -1, msg: '定时任务表达式为空！' });
        } else {
            if (!ruleObj.year && !ruleObj.month && !ruleObj.date &&
                !ruleObj.dayOfWeek && !ruleObj.hour && !ruleObj.minute &&
                !ruleObj.second) {
                console.log('定时任务表达式中所有相关内容均为空！');
                reject({ code: -1, msg: '定时任务表达式中所有相关内容均为空！' });
            }
            // 年
            if (ruleObj.year) {
                rule.year = ruleObj.year;
            }
            // 月
            if (ruleObj.month) {
                rule.month = ruleObj.month;
            }
            // 日
            if (ruleObj.date) {
                rule.date = ruleObj.date;
            }
            // 周
            if (ruleObj.dayOfWeek) {
                rule.dayOfWeek = ruleObj.dayOfWeek;
            }
            // 时
            if (ruleObj.hour) {
                rule.hour = ruleObj.hour;
            }
            // 分
            if (ruleObj.minute) {
                rule.minute = ruleObj.minute;
            }
            // 秒
            if (ruleObj.second) {
                rule.second = ruleObj.second;
            }
        }
        if (!desc) {
            desc = '您有一个任务，请及时处理！'
        }
        schedule.scheduleJob(name, rule, () => {
            console.log('scheduleCronstyle:' + new Date());

            User.findById({ _id: '62d8fad61398fb756c038cd0' }, function (err, data) {
                if (err) {
                    reject({ code: -1, msg: err });
                    console.log('err' + err);
                }
                console.log('-----data-----' + data);
                if (data) {
                    const patient = data;
                    if (patient && patient.openID) {
                        var image = '';
                        if (patient.photo) {
                            image = 'https://www.digitalbaseas.com/api/upload/photo-' + String(patient.photo) + '.png';
                        } else {
                            image = 'https://www.digitalbaseas.com/api/upload/photo-header.png';
                        }
                        userTypeStr = 'userType=0';
                        var title = desc;
                        var filter = {
                            openID: patient.openID,
                            message: '任务提醒',
                            title: title,
                            url: 'https://www.digitalbaseas.com/public/login?' + userTypeStr,
                            picUrl: image
                        };
                        console.log('mail filter', filter);
                        wechat.sendwxMessage(`${cfg.wechat.appId}`, `${cfg.wechat.appSecret}`, {
                            touser: filter.openID,
                            msgtype: "news",
                            news: {
                                articles: [{
                                    title: title,
                                    description: filter.message,
                                    url: filter.url,
                                    picurl: filter.picUrl
                                }]
                            }
                        })
                    } else {
                        // 发送短信
                        userTypeStr = 'userType=0';
                        // var message = desc + 'https://www.digitalbaseas.com';
                        var message = desc;
                        console.log('----发送短信----' + message);
                        shortMessage.sendMessage(patient.phone, null, message);
                    }
                }
                resolve({ code: 1, msg: '保存并发送成功！' });
            });
        });
    });
}

/**
 * node-schedule方式启动定时任务，相对灵活，采用此方式进行定时任务得管理
 */
function scheduleCronstyle() {
    // year
    // month
    // date
    // dayOfWeek
    // hour
    // minute
    // second
    // 每分钟的第1秒执行一次
    const rule = new schedule.RecurrenceRule();
    rule.second = 1;

    const job = schedule.scheduleJob(rule, function () {
        // 定时任务执行内容在这里写
        console.log('scheduleCronstyle----rule:' + new Date());
    });
}

/**
 * node-cron表达式方式执行定时任务，不方便管理任务得启动，取消，因此暂不使用该方法
 */
function cronSch() {
    console.log('调用定时任务方法成功cronSch:' + new Date());
    cron.schedule('30 * * * * *', () => {
        console.log('cronSch:' + new Date());
    }, {
        scheduled: true,
        timezone: "Asia/Shanghai"
    });
}

/**
 * 存储短信内容
 * @param {定时任务名称} name 
 * @param {定时任务表达式} cron 
 * @param {项目医生ID} providerID 
 * @param {项目ID} profileID 
 * @param {操作员名称} createBy 
 * @param {患者ID} createBy 
 * @returns 
 */
function saveSchedule(schMsg) {
    // 定时任务名称:生成随机数
    let name = Util.uuid();
    let schedule = new Schedule();
    schedule.name = name;
    schedule.cron = schMsg.cron;
    schedule.desc = schMsg.desc;
    schedule.status = '1';
    schedule.schType = schMsg.schType;
    schedule.patientID = schMsg.patientID;
    schedule.profileID = schMsg.profileID;
    schedule.providerID = schMsg.providerID;
    schedule.templateID = schMsg.templateID;
    schedule.createdBy = schMsg.createdBy;
    schedule.modifiedBy = schMsg.modifiedBy;
    schedule.createDate = new Date();
    schedule.modifiedDate = new Date();
    schedule.detail = schMsg.detail;
    schedule.rule = schMsg.rule;

    console.log('存储定时任务信息----schedule----:' + schedule);
    return new Promise((resolve, reject) => {
        Schedule.create(schedule, (err, data) => {
            console.log('存储定时任务信息----err----:' + err);
            console.log('存储定时任务信息----data----:' + data);
            if (err) {
                console.log('保存失败!失败原因:' + err);
                reject({ code: -1, msg: err });
            }
            resolve({ code: 1, msg: '保存成功', data: data });
        });
    });
}

/**
 * 根据schedule信息，判断入参schedule是否已经在执行中。
 * 如果任务本身不存在，或处于存在未执行状态，则需要重新触发，执行即可
 * @param {*} data schedule信息
 */
function detailSchedule(data) {
    if (Array.isArray(data)) {
        for (let index = 0; index < data.length; index++) {
            const s = data[index];
            if (s.status && s.status == '1') {
                console.log('schedule----' + s);
                console.log('name----' + s.name);
                console.log('rule----' + s.rule);
                console.log('desc----' + s.desc);
                console.log('patientID----' + s.patientID);
                let job = schedule.scheduledJobs[s.name];
                console.log('job----' + job);
                if (job) {
                    let nextInvocation = job.nextInvocation();
                    console.log('nextInvocation----' + nextInvocation);
                    if (null == nextInvocation && s.status == '1') {
                        console.log('任务存在，但处于停滞状态，即将触发执行');
                        startTimer(s.name, s.rule, s.desc, s.patientID);
                    } else {
                        console.log('任务已经处于执行状态，无需重复执行');
                    }
                } else {
                    console.log('任务已经不存在了，需要重新开始执行');
                    startTimer(s.name, s.rule, s.desc, s.patientID);
                }
            } else {
                console.log('任务数据处于取消状态，不能重启，此处特殊说明');
            }
        }
    }
}

/**
 * 查询定时任务接口
 * @param {请求} req 
 * @param {返回} resp 
 */
exports.searchSchedule = (req, resp) => {
    // if (!req.body.providerID) {
    //     console.log('项目医生信息异常' + req.body.providerID);
    //     resp.json({ code: -1, msg: '系统异常' });
    // }
    console.log('查询定时任务接口----开始----');
    Schedule.find(req.body, function (err, data) {
        if (err) {
            res.json({ code: -1, msg: '查询定时任务失败' + err });
            console.log('查询定时任务接口----失败----' + err);
        }
        console.log('查询定时任务接口----成功----');
        console.log(data);
        // resp.json({ code: 1, msg: '查询定时任务成功', data: data });
        // 查询成功后查询原先配置好的定时任务是否正常运行,如果没有正常运行需要重新启动
        // detailSchedule(data).then((data) => {
        //     resp.json({ code: 1, msg: '查询定时任务成功', data: data });
        // });
        console.log('查询定时任务接口----判断该任务是否处于执行状态----');
        if (data && data.lenth > 0) {
            detailSchedule(data);
        }
        resp.json({ code: 1, msg: '查询定时任务成功', data: data });
    }).sort({ "createDate": 'desc' });

}

/**
 * 新增定时任务接口
 * @param {请求} req 
 * @param {返回} resp 
 */
exports.addSchedule = (req, resp) => {
    console.log('新增定时任务接口----开始----');
    console.log('req.body' + req.body);
    // if (!req.body.cron) {
    //     console.log('cron表达式' + req.body.cron);
    //     resp.json({ code: -1, msg: '系统异常' });
    // }
    // if (!req.body.providerID) {
    //     console.log('项目医生信息异常' + req.body.providerID);
    //     resp.json({ code: -1, msg: '系统异常' });
    // }
    if (!req.body.patientID) {
        console.log('医生信息异常' + req.body.providerID);
        resp.json({ code: -1, msg: '医生信息为空！' });
    }
    if (!req.body.templateID) {
        console.log('模板信息异常' + req.body.templateID);
        resp.json({ code: -1, msg: '模板信息为空！' });
    }
    if (!req.body.rule) {
        console.log('定时任务表达式为空' + req.body.rule);
        resp.json({ code: -1, msg: '定时任务表达式为空！' });
    }
    if (!req.body.rule.year && !req.body.rule.month && !req.body.rule.date &&
        !req.body.rule.dayOfWeek && !req.body.rule.hour && !req.body.rule.minute &&
        !req.body.rule.second) {
        resp.json({ code: -1, msg: '定时任务表达式中所有相关内容均为空！' });
    }
    if (!req.body.desc || req.body.desc == '') {
        req.body.desc = '您有一个任务，请及时处理！'
    }
    // if (!req.body.profileID) {
    //     console.log('项目信息异常' + req.body.profileID);
    //     resp.json({ code: -1, msg: '系统异常' });
    // }
    // if (!req.body.createBy) {
    //     console.log('操作员信息异常' + req.body.createBy);
    //     resp.json({ code: -1, msg: '系统异常' });
    // }
    // if (!req.body.desc) {
    //     console.log('描述信息异常' + req.body.desc);
    //     resp.json({ code: -1, msg: '系统异常' });
    // }
    
    saveSchedule(req.body).then((data) => {
        console.log('保存定时任务信息:');
        console.log(data);
        if(data && data.code == 1){
            startTimer(data.data.name, data.data.rule, data.data.desc, data.data.patientID).then((res) => {
                console.log('查询相关定时任务返回值:' + data.data);
                resp.json({ code: 1, msg: '添加成功！', data: data.data });
            });
        }else{
          resp.json(data);  
        }
    });
    
    // let templateID = req.body.templateID;
    // let patientID = req.body.patientID;
    // Schedule.findOne({
    //     $and: [
    //         { templateID: templateID },
    //         { patientID: patientID },
    //         { status: '1' }
    //     ]
    // }, (err, doc) => {
    //     if (err) {
    //         console.log('查询相关定时任务----失败----');
    //         console.log(`查询相关定时任务失败: ${err}`);
    //         res.json({ code: -1, message: `查询相关定时任务失败: ${err}` })
    //     }
    //     if (doc) {
    //         console.log('该项目已经配置过定时任务!' + req.body.desc);
    //         resp.json({ code: -1, msg: '您已经给该项目配置过定时任务!' });
    //     } else {
    //         console.log('查询相关定时任务----保存----');
    //         saveSchedule(req.body).then((data) => {
    //             console.log('保存定时任务信息:' + data);
    //             // resp.json(data);
    //             startTimer(data.name, data.rule, data.desc, data.patientID).then((res) => {
    //                 console.log('查询相关定时任务返回值:' + data);
    //                 resp.json({ code: 1, msg: '添加成功！', data: data });
    //             });
    //         });
    //     }
    // });
}

/**
 * 取消定时任务接口
 * @param {请求} req 
 * @param {返回} resp 
 */
exports.cancelSchedule = (req, resp) => {
    console.log('取消定时任务接口----保存----');
    // if (!req.body.name) {
    //     console.log('定时任务信息异常' + req.body.name);
    //     resp.json({ code: -1, msg: '系统异常' });
    // }

    // 查询定时任务信息并更新成删除状态 status:0
    Schedule.findOneAndUpdate(req.body , {
        $set: {
            status: '0',
            // modifiedBy: modifiedBy,
            modifiedDate: new Date()
        }
    }, (err, data) => {
        if (err) {
            console.log('取消定时任务接口----定时任务取消失败----');
            resp.json({ code: -1, msg: '系统异常' });
        } else {
            console.log('取消定时任务接口----开始取消----');
            console.log(data);
            let job = schedule.scheduledJobs[data.name];
            console.log('job----' + job);
            if (job) {
                job.cancel();
                resp.json({ code: 1, msg: '定时任务取消成功', data: data });
            }else{
                resp.json({ code: 1, msg: '该任务已经处于取消状态！', data: data });
            }
        }
    });
}
