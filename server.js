var express = require('express');
const cron = require('node-cron');
var Visit = require('./app/models/visit');
var User = require('./app/models/user');
var shortMessage = require('./app/middleware/shortMessage');
var wechat = require('./app/middleware/wechat');
var cfg = require('./config/common').config;
var Util = require('./app/utils/util');
var app = express();

//let http = require('http').Server(app);
//var io = require('socket.io');
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
var server = require('http').createServer(app);
let io = require("socket.io")(server);

var helmet = require('helmet');
var databaseConfig = require('./config/database');
var router = require('./app/routes');
//socket connection
var ExpressPeerServer = require('peer').ExpressPeerServer;

//mongoose.connect('mongodb://careline:alex2005@ds040017.mlab.com:40017/careline');
console.log('mongo connecting...', databaseConfig.url);

mongoose.connect(databaseConfig.url);
// mongoose.connect('mongodb://careline-db:dd1b871b-f747-4dbe-a355-e9ecebdc4fa2@https://careline-db.documents.azure.com:443');
var conn = mongoose.connection;

var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;


/* http.createServer(app, function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello World\n');
    let io = socketIO(app);
io.on('connection', (socket) => {
        console.log('user connected');
        socket.on('new-message', (message) => {
            console.log(message);
          });
    });
 }).listen(process.env.PORT || 8080);*/
//const express  = require('express');
//const app      = express();
//const server   = app.listen(8080); // or whatever port you want


//const server = http.createServer(app);

/*const io = require("socket.io")(server);
io.origins((origin, callback) => {
   if (origin !== 'https://www.digitalbaseas.com') {
       return callback('origin not allowed', false);
   }
   callback(null, true);
 });
io.on("connection", () => {
    console.log("Connected!");
});*/


io.on("connection", socket => {
    // Log whenever a user connects
    console.log("user connected");

    // Log whenever a client disconnects from our websocket server
    socket.on("disconnect", function () {
        console.log("user disconnected");
    });

    // When we receive a 'message' event from our client, print out
    // the contents of that message and then echo it back to our client
    // using `io.emit()`
    //on stands for recerive message, emit stands for send message
    socket.on("add-message", message => {
        console.log("Message Received: " + message);
        io.emit("message", {
            type: "new-message",
            text: message
        });
    });
});
// server.listen(8080);

server.listen(8080, () => {
    console.log('started on port 8080');
    task.start();
    task1.start();
});

var task1 = cron.schedule('30 8 * * *', () => {
    var filter = {
        'role': 'patient',
        'profiles': { $elemMatch: { 'name': { $regex: /婴幼儿健康管理/ } } }
    };

    User.find(filter, function (err, data) {
        if (err) {
            console.log('err' + err);
        } else {
            console.log('data');
            console.log(data);
            if (data && data.length > 0) {
                let u1 = data[0];
                for (let index = 0; index < data.length; index++) {
                    const user = data[index];
                    if (user && user.openID) {
                        var image = '';
                        if (u1.photo) {
                            image = 'https://www.digitalbaseas.com/api/upload/photo-' + String(u1.image) + '.png';
                        } else {
                            image = 'https://www.digitalbaseas.com/api/upload/photo-header.png';
                        }
                        var title = '温馨提示';
                        var filter = {
                            openID: user.openID,
                            message: '您有一个每日日志内容需要填写，别忘了处理！',
                            title: title,
                            url: 'https://www.digitalbaseas.com/patient/followups',
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
                        if (user.phone) {
                            var message = `${cfg.mandao.autograph}` + '温馨提示：尊敬的' + user.name + '用户，您好！您有一个每日日志内容需要填写，别忘了处理！https://www.digitalbaseas.com/patient/followups';
                            console.log('----发送短信----' + message);
                            shortMessage.sendMessage(user.phone, null, message);
                        }
                    }
                }
            }
        }
    });
}, {
    scheduled: true,
    timezone: "Asia/Shanghai"
});

var task = cron.schedule('30 10 * * *', () => {
    let startTime = new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0));// 当天0点
    let endTime = new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(23, 59, 59, 999));
    console.log('startTime' + startTime);
    console.log('endTime' + endTime);
    var pipeline = [
        {
            $match: {
                status: 'reserved',
                type: '门诊',
                visitDate: { $gte: startTime, $lte: endTime }
            }
        },
    ];

    Visit.aggregate(pipeline, function (err, Visits) {
        if (err) {
            console.log('err' + err);
        } else {
            console.log('-----Visits-----' + Visits);
            if (Visits && Visits.length > 0) {
                for (let index = 0; index < Visits.length; index++) {
                    const visit = Visits[index];
                    let patient = visit.patient;
                    let provider = visit.provider;
                    if (patient && patient.openID) {
                        var image = '';
                        if (provider.photo) {
                            image = 'https://www.digitalbaseas.com/api/upload/photo-' + String(provider.photo) + '.png';
                        } else {
                            image = 'https://www.digitalbaseas.com/api/upload/photo-header.png';
                        }
                        userTypeStr = 'userType=0';
                        var title = Util.wxDate(visit.visitDate) + '有一个预约，别忘了处理！';
                        var filter = {
                            openID: patient.openID,
                            message: '预约提醒',
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
                        var message = `${cfg.mandao.autograph}` + '预约提醒：尊敬的' + patient.name + '用户，您好！您在明天' + Util.wxDate(visit.visitDate) + '有一条预约，别忘了处理！https://www.digitalbaseas.com/public/login?' + userTypeStr;
                        console.log('----发送短信----' + message);
                        shortMessage.sendMessage(patient.phone, null, message);
                    }
                }
            }
        }
        console.log('-----end-----');
    });

    // let patient = {
    //     _id: '60a2531b017ad623418209a1',
    //     weChatID: 'oQO3mwk4Xmwa-r_hSGQRann-Bycs',
    //     openID: 'oN_YY06EjDph534KZAw7IDSi8Ff0',
    //     email: '13840119662@163.com',
    //     phone: '13840119662',
    //     role: 'patient',
    //     name: 'sch',
    //     gender: '男',
    //     city: '成都',
    //     __v: 0
    // };
    // let provider = null;
    // var image = '';
    // if (provider && provider.photo) {
    //     image = 'https://www.digitalbaseas.com/api/upload/photo-' + String(provider.photo) + '.png';
    // } else {
    //     image = 'https://www.digitalbaseas.com/api/upload/photo-header.png';
    // }
    // userTypeStr = 'userType=0';
    // var title = Util.wxDate(new Date()) + '有一预约，别忘了处理！';
    // var filter = {
    //     openID: patient.openID,
    //     message: '预约提醒',
    //     title: title,
    //     url: 'https://www.digitalbaseas.com/public/login?' + userTypeStr,
    //     picUrl: image
    // };
    // console.log('mail filter', filter);
    // wechat.sendwxMessage(`${cfg.wechat.appId}`, `${cfg.wechat.appSecret}`, {
    //     touser: filter.openID,
    //     msgtype: "news",
    //     news: {
    //         articles: [{
    //             title: title,
    //             description: filter.message,
    //             url: filter.url,
    //             picurl: filter.picUrl
    //         }]
    //     }
    // })
    // 发送短信
    // userTypeStr = 'userType=0';
    // var message = `${cfg.mandao.autograph}` + '预约提醒：尊敬的aaa用户，您好！您在明天' + Util.wxDate(new Date()) + '有一条预约，别忘了处理！https://www.digitalbaseas.com/public/login?' + userTypeStr;
    // shortMessage.sendMessage('13840119662', null, message);

}, {
    scheduled: true,
    timezone: "Asia/Shanghai"
});

const options = {
    debug: true,
    path: '/ws/'
}
const peerserver = ExpressPeerServer(server, options);
peerserver.on('connection', (client) => {
    console.log('peer server connected')
});
peerserver.on('disconnect', (client) => {
    console.log('peer server disconnected')
});
app.use(options.path, peerserver);

app.use(bodyParser.json({
    limit: "50mb"
}));
app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000
}));
app.use(logger('dev')); // Log requests to API using morgan
app.use(cors());

app.use(helmet.hsts({
    maxAge: 31536000000,
    includeSubDomains: true,
    force: true
}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});




 






//ssl token
//http://www.digitalbaseas.com/.well-known/acme-challenge/wqOJtlIhI9YcqqsncFi8vIIqoM2w2f27xUQwAsiTpOc
//http://www.digitalbaseas.com/.well-known/acme-challenge/2ZFNEV8pmkdlXvPs6zmaR4QojDfu0I-vaJwxFuEFAUQ

app.get('/.well-known/acme-challenge/5Ye5DCETLMz471AgBjuMJyMp_T0v0u2t69XOTBvTLno', function (req, res) {
 

    res.send('5Ye5DCETLMz471AgBjuMJyMp_T0v0u2t69XOTBvTLno.yT40tVUHzz5ObCQcOZBeRcR5LEyhj0-Do0U0cUsTf9o');

});

//MP_verify_XVYagWn8spe5g6t1.txt

app.get('/MP_verify_XVYagWn8spe5g6t1.txt', function (req, res) {
 

    res.send('XVYagWn8spe5g6t1');

});


/*var storage = GridFsStorage({
    gfs: gfs,
    filename: function(req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    },
    metadata: function(req, file, cb) {
        cb(null, { originalname: file.originalname });
    },
    root: 'uploads' //root name for collection to store files into
});
var upload = multer({ //multer settings for single upload
    storage: storage
}).single('image');*/


router(app);