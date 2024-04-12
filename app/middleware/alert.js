const UserController = require('../controllers/users'),
  WechatMiddlwware = require('./wechat'),
  AxidbMiddlwware = require('./axidb'),
  Util = require('../utils/util'),
  cfg = require('../../config/common').config;

/*-----------------------------
 * alert sample request 
 * 
 *  {
      "taskId": "axidb",          cron task_id, used by all API, pre-defined key for a task
      "pattern": "2 * * * * * *", cron timer schedule pattern , only used by create
      "params": {                 custom axidb alert paramters:
        "range": "2m",            to calc start date to polling, 1y, 2m, 3d, 4H, 10M, 30S
        "value1": 40,             ear temperature - upper limit
        "value2": 60,             blood pressure - lower limit
        "value3": 120             heart beat - upper limit
 *  }
-----------------------------*/

exports.run = async (request) => {

  let params = {
    ...request,
    dateFrom: Util.dateFrom(request.range)
  };

  let sql = `SELECT s.UNID, s.DateTime as DateTime1,  s.Value1 as Value0,
c.DateTime as DateTime2, c.Value1, c.Value2, c.Value3, c.Value4 
FROM (
SELECT * FROM SimpleDB s0
WHERE  s0.DateTime = (SELECT max(DateTime) FROM SimpleDB  WHERE UNID = s0.UNID)
AND DevProp ='13' AND Value1 > '${params.value1}' AND DateTime > '${params.dateFrom}' 
GROUP BY UNID ) s
INNER JOIN 
( SELECT * FROM CombineDB  c0
WHERE c0.DateTime = (SELECT max(DateTime) FROM CombineDB  WHERE UNID = c0.UNID) 
AND DevProp ='15' AND (Value2 < '${params.value2}' AND LENGTH(Value2) = 2 ) 
AND (Value3 > '${params.value3}' AND LENGTH(Value3) = 3) 
AND DateTime > '${params.dateFrom}' GROUP BY UNID  ) c
ON c.UNID = s.UNID`;

  AxidbMiddlwware.axiconn.query(sql, function (err, results) {
    if (err) {
      console.log('Error polling axiDB: ', err)
    }
    for (let row of results) {
      // console.log('alert unid :', row.UNID)
      UserController.getUersbyUNID(row.UNID).then(data => {
        if (data) {
          //format date
          let t = Util.wxDate(row.DateTime2);
          //get provider openID
          let providerId = (data.providers) ? data.providers[0].openID : null;
          if (providerId) {
            WechatMiddlwware.sendwxMessage(cfg.wechat.appId, cfg.wechat.appSecret, {
              touser: providerId,
              msgtype: "news",
              news: {
                articles: [{
                  title: '数基健康 - 败血症预警系统',
                  description: `${data.name} ${data.birthday} ${data.gender} 耳溫: ${row.Value0} 血壓: ${row.Value2} 心跳: ${row.Value3} 时间: ${t}`,
                  url: cfg.homepage,
                  picurl: data.photo
                }]
              }
            });
          }
        }
      });
    }
  });
}