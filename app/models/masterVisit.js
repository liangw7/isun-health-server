var mongoose = require('mongoose');

var masterVisitSchema = new mongoose.Schema({
    inhosp_stas: {// 在院状态
        type: String
    },
    vali_flag: {// 有效标志0:删除;1:有效
        type: String
    },
    ipt_no: {// 住院号
        type: String
    },
    adm_caty: {// 入院科别
        type: String
    },
    adm_ward: {// 入院病区
        type: String
    },
    adm_ward_no: {// 入院病区床号 
        type: String
    },
    adm_date: {// 入院日期
        type: Date
    },
    dscg_date: {// 出院日期
        type: Date
    },
    dscg_caty: {// 出院科别
        type: String
    },
    dscg_ward: {// 出院病区
        type: String
    },
    dscg_ward_no: {// 出院病区床号
        type: String
    },
    ipt_days: {// 住院天数
        type: Number
    },
    deptdrt_name: {// 科主任姓名
        type: String
    },
    chfdr_name: {// 主任(副主任)医师姓名
        type: String
    },
    atddr_name: {// 主治医生姓名
        type: String
    },
    chfpdr_name: {// 主诊医师姓名
        type: String
    },
    ipt_dr_name: {// 住院医师姓名
        type: String
    },
    resp_nurs_name: {// 责任护士姓名
        type: String
    },
    train_dr_name: {// 进修医师姓名
        type: String
    },
    intn_dr_name: {// 实习医师姓名
        type: String
    },
    patientID: {
        type: String
    },
    providerID: {
        type: String
    },
    provider: {
        type: Object
    },
    patient: {
        type: Object
    },
    patientName: {
        type: String
    },
    providerName: {
        type: String
    },
    patientEmail: {
        type: String
    },
    providerEmail: {
        type: String
    },
    patientGender: {
        type: String
    },
    patientBirthday: {
        type: Date
    },
    providerGender: {
        type: String
    },
    providerSpecialty: {
        type: String
    },
    masterID: {
        type: String
    },
    type: {
        type: String
    },
    followupType: {
        type: String
    },
    status: {
        type: String
    },
    masterDate: {
        type: Date
    },
    createdBy: {
        type: Object
    },
    modifiedBy: {
        type: Object
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('masterVisit', masterVisitSchema);