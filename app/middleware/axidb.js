const mysql = require('mysql'),
    Util = require('../utils/util'),
    cfg = require('../../config/common').config;

const axiconn = mysql.createConnection(cfg.axiconn);

exports.axiconn = axiconn;

// axiconn.connect();

/********************
 * 
 * sample request ( all fileds are optiosnal)
 *  url: api/axidb/simple, combine, complex
 *  {
 *      "unid" : "222222"       if missing, get  value for all clients
 *      "code" : "13"           valid codes: 11, 13, 15, 17
 *      "from" : "2020-04-10"   default value is 1 year prior to now
 *      "to"   : "2020-07-10"   default value is now()
 *      "list" : "yes"          if exists, get a list of value, otherwise, only latest value
 *      "limit": 10
 *      "offset": 0
 *      "order": "DESC"         default value is DESC   (DESC | ASC)
 *      "fields": "DevProp, Value1"  return feilds - default: UNID, MAX(DateTime) as DateTime, 
 *  }
 *******************/

function sqlParam(req, table, code = '11') {
    let param = {}
    let d = Util.dateRange();
    //set default value if missing
    param.table = table;
    param.id = req.body.unid || null;
    param.from = req.body.from || d.start;
    param.to = req.body.to || d.end;
    param.code = req.body.code || code;
    param.limit = req.body.limit || 10;
    param.offset = req.body.offset || 0;
    param.list = req.body.list || null;
    param.order = req.body.order || 'DESC';
    param.fields = req.body.fields || 'Value1';
    return param
}

function sql_all(param) {
    return Util.json2sql({
        fields: `UNID, MAX(DateTime) as DateTime, ${param.fields}`,
        table: `${param.table}`,
        criteria: [
            `DevProp = ${param.code}`,
            `DateTime BETWEEN '${param.from}' AND '${param.to}'`
        ],
        logic: 'AND',
        groupby: 'UNID',
        limit: `${param.limit}`,
        offset: `${param.offset}`
    });
}

function sql_unid(param) {
    return Util.json2sql({
        fields: `MAX(DateTime) as DateTime, ${param.fields}`,
        table: `${param.table}`,
        criteria: [
            `UNID = '${param.id}'`,
            `DevProp = '${param.code}'`,
            `DateTime BETWEEN '${param.from}' AND '${param.to}'`
        ],
        logic: 'AND'
    });
}


function sql_unid_list(param) {
    return Util.json2sql({
        fields: `DateTime, ${param.fields}`,
        table: `${param.table}`,
        criteria: [
            `UNID = '${param.id}'`,
            `DevProp = '${param.code}'`,
            `DateTime BETWEEN '${param.from}' AND '${param.to}'`
        ],
        logic: 'AND',
        orderby: `DateTime ${param.order} `,
        limit: `${param.limit}`,
        offset: `${param.offset}`
    });
}

function param2sql(param) {
    return (Util.isUndef(param.id)) ? sql_all(param) :
        (Util.isUndef(param.list)) ? sql_unid(param) : sql_unid_list(param);
}

exports.getSimpleDB = (req, res, next) => {
    //體重 (DevProp =11) 耳溫 (DevProp =13) 放在 SimpleDB
    const param = sqlParam(req, 'SimpleDB', '11');
    const sql = param2sql(param);

    axiconn.query(sql, function (err, results, fields) {
        if (err) {
            res.send({
                code: 500,
                message: err
            });
        } else {
            res.json({
                code: 200,
                data: results,
                message: '體重(11) 耳溫(13) data'
            });
        }
    });
}

exports.getCombineDB = (req, res, next) => {
    //血壓 (DevProp =15) 血糖 (DevProp =17) 放在 CombineDB
    const param = sqlParam(req, 'CombineDB', '15');
    const sql = param2sql(param);

    axiconn.query(sql, function (err, results, fields) {
        if (err) {
            res.send({
                code: 500,
                message: err
            });
        } else {
            res.json({
                code: 200,
                data: results,
                message: '血壓(15) 血糖(17) data'
            });
        }
    });
}

exports.getComplexDB = (req, res, next) => {
    //血脂 放在 ComplexDB
    const param = sqlParam(req, 'ComplexDB', '30');
    const sql = param2sql(param);

    axiconn.query(sql, function (err, results, fields) {
        if (err) {
            res.send({
                code: 500,
                message: err
            });
        } else {
            res.json({
                code: 200,
                data: results,
                message: '血脂 data'
            });
        }
    });
}

exports.graphsql = (req, res, next) => {

    let sql = `SELECT ${req.body.fields} FROM ${req.body.table} WHERE ${req.body.criteria} `
    axiconn.query(sql, function (err, results, fields) {
        if (err) {
            res.send({
                code: 500,
                message: err
            });
        } else {
            res.json({
                code: 200,
                data: results,
                message: `${req.body.table} data`
            });
        }
    });
}