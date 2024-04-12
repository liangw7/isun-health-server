const cron = require('node-cron'),
  AlertMiddlwware = require('./alert'),
  Util = require('../utils/util');
  var app = express();
  var server = require('http').createServer(app);
// corn pattern for scheduler
/*
# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# │ │ │ │ │ │
# * * * * * *
*/

/* -----------------------------
  cron task  sample request 
   url: api/cron/start, stop, create, status, dateFrom
   
   {
      "taskId": "axidb",          cron task_id, used by all API, pre-defined key for a task
      "pattern": "2 * * * * * *", cron timer schedule pattern , only used by create
      "timezone": "Asia/Shanghai",
      "params": {                 custom params for callabck task
        ....
      }
   }
-----------------------------*/

const callback = {
  "axidb": AlertMiddlwware.run
}

let tasks = new Map();

exports.dateFrom = (req, res) => {
  res.send({
    code: 200,
    range: req.body.range,
    now: (new Date()).toISOString(),
    dateFrom: Util.dateFrom(req.body.range)
  });
}

exports.start = (req, res) => {
  const id = req.body.taskId || null;
  if (Util.isUndef(id))
    res.send({
      code: 400,
      message: 'invalid cron request'
    });

  if (!Util.isUndef(tasks[id])) {
    tasks[id].start();
    res.send({
      code: 200,
      message: `cron task id: ${id} started`
    });
  } else {
    res.send({
      code: 400,
      message: `task id: ${id} not found`
    });
  }
}

exports.stop = (req, res) => {
  const id = req.body.taskId || null;
  if (Util.isUndef(id))
    res.send({
      code: 400,
      message: 'invalid cron request'
    });

  if (!Util.isUndef(tasks[id])) {
    tasks[id].stop();
    res.send({
      code: 200,
      message: `cron task id: ${id} stopped`
    });
  } else {
    res.send({
      code: 400,
      message: `task id: ${id} not found`
    });
  }
}

exports.status = (req, res) => {
  const id = req.body.taskId || null;
  if (Util.isUndef(id))
    res.send({
      code: 400,
      message: 'invalid cron request'
    });

  if (!Util.isUndef(tasks[id])) {
    let st = tasks[id].getStatus();
    res.send({
      code: 200,
      message: st
    });
  } else {
    res.send({
      code: 400,
      message: `task id: ${id} not found`
    });
  }
}

exports.create = (req, res) => {
  const id = req.body.taskId || null;
  if (Util.isUndef(id) || Util.isUndef(req.body.pattern))
    res.send({
      code: 400,
      message: 'invalid cron request'
    });

  if (!Util.isUndef(tasks[id])) {
    console.log("destory task")
    tasks[id].destroy();
    tasks[tasks.get(id)] = null;
  }

  tasks[id] = cron.schedule(req.body.pattern, () => {
    console.log(`task id ${id}  is triggered`);
    callback[req.body.taskId](req.body.params);
  }, {
    scheduled: true,
    timezone: req.body.timezone || "Asia/Shanghai"
  });
  // tasks[id].start();
  res.send({
    code: 200,
    message: `task id ${id} created`
  });
}

var task = cron.schedule('* * * * *', () => {
  console.log('stopped task');
}, {
  scheduled: true,
  timezone: "Asia/Shanghai"
});

server.listen(8080, () => {
  console.log('started on port 8080');
  task.start();
});
