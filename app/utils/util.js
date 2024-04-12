//const fs = require("fs");
const cfg = require('../../config/common').config;

let utils = {
  isUndef: (v) => {
    return v === undefined || v === null || v === ''
  },

  isEmpty: (obj) => {
    return Object.keys(obj).length == 0
  },

  wxDate: (dateTime) => {
    let t = (new Date(dateTime)).toISOString().slice(0, 19);
    t = t.substr(5, t.length);
    t = t.replace("-", "月");
    t = t.replace("T", "日");
    return t;
  },

  dateFrom: (interval) => {
    let unit = interval[interval.length - 1];
    let span = parseInt(interval.substr(0, interval.length - 1), 10);
    let d = new Date();

    switch (unit) {
      case 'y':
        d.setFullYear(d.getFullYear() - span);
        break;
      case 'm':
        d.setMonth(d.getMonth() - span);
        break;
      case 'd':
        d.setDate(d.getDate() - span);
        break;
      case 'H':
        d.setHours(d.getHours() - span);
        break;
      case 'M':
        d.setMinutes(d.getMinutes() - span);
        break;
      case 'S':
        d.setSeconds(d.getSeconds() - span);
        break;
      default:
        break;
    }
    return d.toISOString();

  },

  dateRange: (start = '12m', endDay = 1) => {
    let t = new Date();
    t.setDate(t.getDate() + endDay);

    return {
      start: utils.dateFrom(start),
      end: t.toISOString()
    }
  },

  json2mongosql: (obj) => {
    const keys = Object.keys(obj)
    let conds = []

    for (key of keys) {
      let val = obj[key]
      if (Array.isArray(val))
        conds.push({
          [key]: {
            $gte: new Date(val[0]),
            $lt: new Date(val[1])
          }
        });
      else if (/^([0-9]{1,2})[ymdHMS]$/.test(val))
        conds.push({
          [key]: {
            $gte: new Date(utils.dateFrom(val))
          }
        });
      else
        conds.push({
          [key]: val
        })
    }
    return {
      $and: conds
    }
  },

  // format: 1. host, 2. cgi, 3. [ params ..]
  /* example
    { 
      host: "127.0.0.1:8080/cgi-bin",
      cgi: /token,
      params: {
        appid: appId,       
        secret: appSecret
      }
    }
  */

  json2url: (obj) => {
    let url = `${obj.host}${obj.cgi}?`;
    const keys = Object.keys(obj.params)
    for (i in keys) {
      if (i > 0) url += '&';
      url += `${keys[i]}=${obj.params[keys[i]]}`;
    }
    // console.log(url);
    return url
  },


  /* sql object example
      { 
        fields: 'UNID, MAX(DateTime) as DateTime, DevProp, Value1',
        table: 'SimpleDB',
        criteria: [
          'DevProp = '13',       
          'DateTime BETWEEN '2020/05/01' AND '2020/07/31'
        ],
        logic: ' and'
        orderby: 'date DESC',
        groupby: 'UNID'
        limit: 'limit',
        offset: 'offset'
      }
    */
  json2sql: (obj) => {

    let sql = `SELECT ${obj.fields} FROM ${obj.table} WHERE `;
    const keys = Object.keys(obj.criteria)
    for (i in keys) {
      if (i > 0) sql += ` ${obj.logic} `;
      sql += `${obj.criteria[keys[i]]}`;
    }
    if (obj.orderby) sql += ` ORDER BY ${obj.orderby}`;
    if (obj.groupby) sql += ` GROUP BY ${obj.groupby}`;
    if (obj.limit) sql += ` LIMIT ${obj.limit}`;
    if (obj.offset) sql += ` OFFSET ${obj.offset}`;
    // console.log(sql);

    return sql
  },

  // 商户订单号  
  out_trade_no: () => {
    return Math.random().toString(36).substr(2, 15);
  },

  //UUID
  uuid: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  //把金额转为分
  getMoney: function (money) {
    return parseFloat(money) * 100;
  },

  // 随机字符串产生函数  
  createNonceStr: function () {
    return Math.random().toString(36).substr(2, 15);
  },

  // 时间戳产生函数  
  createTimeStamp: function () {
    return parseInt(new Date().getTime() / 1000) + '';
  },

  /**
  * 正则校验手机号
  * @param {手机号} mobile 
  */
  checkMobile: function (mobile) {
    if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(mobile))) {
      console.log(mobile + "入参非手机号码");
      return false;
    } else {
      console.log(mobile + "入参为手机号码");
      return true;
    }
  },

  /**
   * 正则校验邮箱
   * @param email 邮箱
   * @returns 
   */
  checkEmail: function (email) {
    if (!(/^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/.test(email + ""))) {
      console.log(email + "入参非邮箱");
      return false;
    } else {
      console.log(email + "入参为邮箱");
      return true;
    }
  },

  /**
   * 校验角色信息准确性
   * 'nurse',
   * 'physicalTherapist',
   * 'caseManager',
   * 'marketOperator',
   * 'provider',
   * 'admin',
   * 'patient'
   * @param {前端角色入参} role 
   * @returns 
   */
  checkRoleIsRight(role) {
    let roleArray = cfg.healthCareWorkerRoles;
    roleArray.push('patient');
    // roleArray.push('admin');
    let flag = false;

    for (let r of roleArray) {
      if (role == r) {
        flag = true;
      }
    }
    return flag;
  }

}

module.exports = utils;