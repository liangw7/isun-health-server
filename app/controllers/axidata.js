const mysql = require('mysql');

/*const axiconn = mysql.createConnection({
    host: 'bj-cdb-qcpjo1zh.sql.tencentcdb.com',
    user: 'AIoT2',
    port: '63182',
    password: 'aiot7534',
    database: 'AxiDB_v2'
});*/

const axiconn = mysql.createConnection({
    host: 'db.axilink.pro',
    user: 'AIoT2',
    port: '10109',
    password: 'aiot7534',
    database: 'AxiDB_v2'
});


axiconn.connect();

/********************
 * 
 * sample request ( all fileds are optional)
 *  url: aapi/axidb/simple, api/axidb/combine, api/axidb/complex
 *  {
 *      "unid" : "222222"       if missing, get  value for all clients
 *      "code" : "13"           valid code: 11, 13, 15, 17
 *      "from" : "2020-04-10"   default value is 1 year prior to now
 *      "to"   : "2020-07-10"   default value is now()
 *      "list" : "yes"          if yes, get a list of value, otherwise, only latest value
 *      "limit": 10
 *      "offset": 0
 *      "order": "DESC"        default value is DESC   (DESC | ASC)
 * 
 *  }
 *******************/

function isUndef(v) {
    return v === undefined || v === null || v === ''
}

function sqlParam(req, code='11') {
    let param = {}
    let d = new Date();
    d.setFullYear(d.getFullYear() - 1);

    param.id = req.body.unid || null;
    param.from = req.body.from || d.toISOString().substr(0, 10);
    param.to = req.body.to || (new Date()).toISOString().substr(0, 10);
    param.code = req.body.code || code;
    param.limit = req.body.limit || 10;
    param.offset = req.body.offset || 0;
    param.list = req.body.list || null;
    param.order = req.body.order || 'DESC'

    return param
}

exports.getSimpleDB = function (req, res, next) {
    //體重 (DevProp =11) 耳溫 (DevProp =13) 放在 SimpleDB
    const param = sqlParam(req);
    const sql = (isUndef(param.id))?    `SELECT UNID, MAX(DateTime) as DateTime, DevProp, Value1 FROM SimpleDB WHERE DevProp = ${param.code} AND DateTime BETWEEN '${param.from}' AND '${param.to}' GROUP BY UNID LIMIT ${param.limit} OFFSET ${param.offset}` :
                (isUndef(param.list))?  `SELECT UNID, MAX(DateTime) as DateTime, DevProp, Value1 FROM SimpleDB WHERE UNID = ${param.id} AND DevProp = '${param.code}' AND DateTime BETWEEN '${param.from}' AND '${param.to}'` :
                                        `SELECT UNID, DateTime, DevProp, Value1 FROM SimpleDB WHERE UNID = ${param.id} AND DevProp = '${param.code}' AND DateTime BETWEEN '${param.from}' AND '${param.to}' ORDER BY DateTime ${param.order} LIMIT ${param.limit} OFFSET ${param.offset}`;

    axiconn.query(sql, function (err, results, fields) {
        if (err) {
            res.send({code: 500, message: err });
        }
        res.json({
            code: 200,
            data: results,
            message: '體重(11) 耳溫(13) data'
        });
    });
}

exports.getCombineDB = function (req, res, next) {
    //血壓 (DevProp =15) 血糖 (DevProp =17) 放在 CombineDB
    const param = sqlParam(req, '15');
    const sql = (isUndef(param.id))?    `SELECT UNID, MAX(DateTime) as DateTime, DevProp, Value1, Value2, Value3, Value4 FROM CombineDB WHERE DevProp ='${param.code}' AND DateTime BETWEEN '${param.from}' AND '${param.to}' GROUP BY UNID  LIMIT ${param.limit} OFFSET ${param.offset}` :
                (isUndef(param.list))?  `SELECT UNID, MAX(DateTime) as DateTime, DevProp, Value1, Value2, Value3, Value4 FROM CombineDB WHERE UNID = ${param.id} AND DevProp = '${param.code}'  AND  DateTime BETWEEN '${param.from}' AND '${param.to}'` :
                                        `SELECT UNID, DateTime, DevProp, Value1, Value2, Value3, Value4  FROM CombineDB WHERE UNID = ${param.id} AND DevProp = '${param.code}' AND DateTime BETWEEN '${param.from}' AND '${param.to}' ORDER BY DateTime ${param.order} LIMIT ${param.limit} OFFSET ${param.offset}`;
   
    axiconn.query(sql, function (err, results, fields) {
        if (err) {
            res.send({code: 500, message: err });
        }
        res.json({
            code: 200,
            data: results,
            message: '血壓(15) 血糖(17) data'
        });
    });
}

exports.getComplexDB = function (req, res, next) {
    //血脂 放在 ComplexDB
    const param = sqlParam(req);
    const sql = (isUndef(param.id))? `SELECT UNID, MAX(DateTime) as DateTime, Value FROM ComplexDB WHERE DateTime BETWEEN '${param.from}' AND '${param.to}'  GROUP BY UNID  LIMIT ${param.limit} OFFSET ${param.offset}` :
            (isUndef(param.list))?   `SELECT UNID, MAX(DateTime) as DateTime, Value FROM ComplexDB WHERE UNID = ${param.id} AND DateTime BETWEEN '${param.from}' AND '${param.to}'` :
                                     `SELECT UNID, DateTime, Value FROM ComplexDB WHERE UNID = ${param.id} AND DateTime BETWEEN '${param.from}' AND '${param.to}' ORDER BY DateTime ${param.order} LIMIT ${param.limit} OFFSET ${param.offset}`;

    axiconn.query(sql, function (err, results, fields) {
        if (err) {
            res.send({code: 500, message: err });
        }
        res.json({
            code: 200,
            data: results,
            message: '血脂 data'
        });
    });
}