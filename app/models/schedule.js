var mongoose = require('mongoose');

var problemSchema = new mongoose.Schema({

    name: {// 任务名称（随机生成，无需上传）
        type: String
    },
    cron: {// 表达式（暂时废弃，采用rule形式）
        type: String
    },
    desc: {// 详细描述，用于定时任务通知内容使用
        type: String
    },
    status: {// 状态（0：停用；1：正在使用）
        type: String
    },
    schType: {// 任务类型（目前为想好是否能够用到，先预留）
        type: String
    },
    patientID: {// 患者id
        type: String
    },
    profileID: {// 项目id
        type: String
    },
    providerID: {// 医生id
        type: String
    },
    templateID: {// 模板id
        type: String
    },
    createdBy: {// 创建任务人
        type: Object
    },
    modifiedBy: {// 修改任务人
        type: Object
    },
    createDate: {// 创建时间
        type: Date
    },
    modifiedDate: {// 修改时间
        type: Date
    },
    detail: {// 预留内容
        type: Object
    },
    // 定时任务表达式格式
    rule: {
        year: {// 年
            type: Object
        },
        month: {// 月
            type: Object
        },
        date: {// 日
            type: Object
        },
        dayOfWeek: {// 周
            type: Object
        },
        hour: {// 时
            type: Object
        },
        minute: {// 分
            type: Object
        },
        second: {// 秒
            type: Object
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('schedule', problemSchema);
