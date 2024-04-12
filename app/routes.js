var AuthenticationController = require('./controllers/authentication'),
  TodoController = require('./controllers/todos'),
  VisitController = require('./controllers/visits'),
  PathwayController = require('./controllers/pathway'),
  FollowupController = require('./controllers/followup'),
  UserController = require('./controllers/users'),
  MedicalHistoryController = require('./controllers/MedicalHistory'),
  NoteController = require('./controllers/note'),
  MedController = require('./controllers/meds'),
  RequestController = require('./controllers/Request'),
  ImageController = require('./controllers/images'),
  ScreeningController = require('./controllers/screening'),
  CategoryController = require('./controllers/categories'),
  DataController = require('./controllers/data'),
  ReportController = require('./controllers/report'),
  MailController = require('./controllers/mail'),
  OrderItemController = require('./controllers/orderItem'),
  LabItemController = require('./controllers/labItem'),
  ImageItemController = require('./controllers/imageItem'),
  UploadDataController = require('./controllers/upload'),
  ProblemController = require('./controllers/problem'),
  InvoiceController = require('./controllers/invoice'),
  //    Image = require('./models/image');
  LabController = require('./controllers/labs'),
  OrderController = require('./controllers/orders'),
  DiagnosisController = require('./controllers/diagnosis'),
  MasterVisitController = require('./controllers/masterVisit'),
  WechatBoxController = require('./middleware/wechat-box'),
  // AxidbController = require('./controllers/axidata'),
  AxidbMiddlwware = require('./middleware/axidb'),
  // UploadMiddleware = require('./middleware/upload'),
  // CronMiddleware = require('./middleware/cron'),
  // WechatMiddleware = require('./middleware/wechat'),
  WxPayMiddleware = require('./middleware/wxpay'),
  shortMessage = require('./middleware/shortMessage'),
  schedule = require('./middleware/schedule'),
  // S3Middleware = require('./middleware/s3file'),
  express = require('express'),
  passportService = require('../config/passport'),
  passport = require('passport');

var path = require('path');
const fs = require('fs')
const {
  promisify
} = require('util')
const https = require("https");
const request = require("request");
const unlinkAsync = promisify(fs.unlink)
var multer = require('multer');
const { Wechat } = require('wechat-jssdk');
// const { WechatClient } = require('messaging-api-wechat');
const wechatConfig = {
  //set your oauth redirect url, defaults to localhost
  "wechatRedirectUrl": "https://www.digitalbaseas.com/wechat/oauth-callback",
  //"wechatToken": "wechat_token", //not necessary required
  "appId": 'wx1456c566ec3e6686',
  "appSecret": '8ada6bb8a95c8d79abf7a374688aa9cd',
  "card": true, //enable cards
  "payment": true, //enable payment support
  "merchantId": '1601139967', //
  "paymentSandBox": false, //dev env
  "paymentKey": 'GNHsDl0y4Y4RNlUAWGXOKcjzc1SraA9X', //API key to gen payment sign
  "paymentCertificatePfx": fs.readFileSync(path.join(process.cwd(), 'apiclient_cert.p12')),
  //default payment notify url
  "paymentNotifyUrl": `http://www.digitalbaseas.com/api/wx/notify`,
  //mini program config
  // "miniPro32oj888qq8117`gram": {
  //   "appId": "mp_appid",
  //  "appSecret": "mp_app_secret",
  // }
}
const wx = new Wechat(wechatConfig);

var roleList = ['admin', 'provider', 'market'];

var requireAuth = passportService.authenticateJWT,
  requireLogin = passportService.authenticateCredentials;
// var requireAuth = passportService.authenticate('jwt', { session: false }),
//     requireLogin = passportService.authenticate('local', { session: false });
//console.log ('requireAuth',requireAuth)
module.exports = function (app) {

  var apiRoutes = express.Router();
  var authRoutes = express.Router();
  var todoRoutes = express.Router();
  var visitRoutes = express.Router();
  var pathwayRoutes = express.Router();
  var followupRoutes = express.Router();
  var MedicalHistoryRoutes = express.Router();
  var noteRoutes = express.Router();
  var MedRoutes = express.Router();
  var RequestRoutes = express.Router();
  var userRoutes = express.Router();
  var imageRoutes = express.Router();
  var labRoutes = express.Router();
  var orderRoutes = express.Router();
  var screeningRoutes = express.Router();
  var CategoryRoutes = express.Router();
  var dataRoutes = express.Router();
  var reportRoutes = express.Router();
  var diagnosisRoutes = express.Router();
  var mailRoutes = express.Router();
  var orderItemRoutes = express.Router();
  var labItemRoutes = express.Router();
  var imageItemRoutes = express.Router();
  var problemRoutes = express.Router();
  var uploadDataRoutes = express.Router();
  var uploadRoutes = express.Router();
  var tttRoutes = express.Router();
  var axidbRoutes = express.Router();
  var wxPayRoutes = express.Router();
  var invoiceRoutes = express.Router();
  var shortMessageRoutes = express.Router();
  var scheduleRoutes = express.Router();
  var masterVisitRoutes = express.Router();
  var wxRoutes=express.Router();

  // Auth Routes
  apiRoutes.use('/auth', authRoutes);
  authRoutes.post('/register', AuthenticationController.register);
  authRoutes.post('/registerFamliy', AuthenticationController.registerFamliy);
  authRoutes.post('/login', requireLogin, AuthenticationController.login);
  authRoutes.get('/protected', requireAuth, function (req, res) {
    // console.log ('requireAuth',requireAuth)
    res.send({
      content: 'Success'
    });
  });

  //upload routes

  apiRoutes.use('/ttt', tttRoutes);
  // console.log ('here api test')
  tttRoutes.get('/', function (req, res) {
    res.send('Hello World\n');

  });

  //app.use('/ttt',tttRoutes)
  apiRoutes.use('/upload', uploadRoutes);

  uploadRoutes.get('/', function (req, res) {
    res.end('file catcher example');
  });


  uploadRoutes.get('/:filename', function (req, res, next) {

    var filename = req.params.filename,

      root = DIR + '/';
    //   console.log ('dir', DIR)

    var options = {
      root: root,
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    };

    res.sendFile(filename, options, (err) => {
      if (err) {
        next(err);
      } else {
        //        console.log('Sent:', filename);
      }
    });
  })

  const DIR = '././uploads';

  let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR);
    },
    filename: (req, file, cb) => {
      //  console.log ('file', file.fieldname);
      cb(null, file.fieldname + '-' + file.originalname);
    }
  });
  let upload = multer({
    storage: storage
  });

  uploadRoutes.post('/', upload.single('photo'), function (req, res) {
    if (!req.file) {
      //  console.log("No file received");
      return res.send({
        success: false
      });

    } else {
      console.log('file received');
      return res.send({
        success: true
      })
    }
  });

  // Todo Routes
  apiRoutes.use('/todo', todoRoutes);
  todoRoutes.get('/todoID/:todoID', requireAuth, TodoController.getById);
  todoRoutes.get('/', requireAuth, TodoController.getTodos);
  todoRoutes.post('/', requireAuth, TodoController.createTodo);
 // todoRoutes.post('/getByFilter', requireAuth, TodoController.getByFilter);
  todoRoutes.post('/filter', requireAuth, TodoController.getByFilter);
  todoRoutes.delete('/:todoID', requireAuth, TodoController.deleteTodo);
  todoRoutes.get('/patient/:patientID', requireAuth, TodoController.getTodosByPatient);
  todoRoutes.get('/provider/:providerID', requireAuth, TodoController.getTodosByProvider);
  todoRoutes.get('/requester/:requesterID', requireAuth, TodoController.getTodosByRequester);
  todoRoutes.post('/update', requireAuth, TodoController.updateTodo);

  // Visit Routes
  apiRoutes.use('/visits', visitRoutes);
  visitRoutes.get('/', VisitController.getVisits);
  visitRoutes.post('/', VisitController.createVisit);
  visitRoutes.delete('/:visitID', VisitController.deleteVisit);
  visitRoutes.post('/patient', VisitController.getVisitsByPatient);
  visitRoutes.post('/filter', VisitController.getVisitsByFilter);
  visitRoutes.post('/getVisitsForProviderList', VisitController.getVisitsForProviderList);
  visitRoutes.post('/getScheduledVisitsByFilter', VisitController.getScheduledVisitsByFilter);
  visitRoutes.post('/provider', VisitController.getVisitsByProvider);
  visitRoutes.get('/requester/:requesterID', VisitController.getVisitsByRequester);
  visitRoutes.post('/update', VisitController.UpdateVisit);
  visitRoutes.post('/monthlyVisits', VisitController.getMonthlyVisits);
  visitRoutes.post('/getFollowupsByDate', VisitController.getFollowupsByDate);
  visitRoutes.post('/getOneVisit', VisitController.getOneVisit);
  visitRoutes.post('/getMonthlyVisitsByProvider', VisitController.getMonthlyVisitsByProvider);
  visitRoutes.post('/getVisitListByFilter', VisitController.getVisitListByFilter);
  visitRoutes.post('/getVisitPartByFilter', VisitController.getVisitPartByFilter);
  visitRoutes.post('/getMonthlyVisits', VisitController.getMonthlyVisits);
  visitRoutes.post('/getProviderVisits', VisitController.getProviderVisits);

  // MasterVisit Routes
  apiRoutes.use('/masterVisit', masterVisitRoutes);
  masterVisitRoutes.get('/', MasterVisitController.getAllMasterVisits);
  masterVisitRoutes.post('/getMasterVisitsByFilter', MasterVisitController.getMasterVisitsByFilter);
  masterVisitRoutes.post('/update', MasterVisitController.update);
  masterVisitRoutes.post('/create', MasterVisitController.create);

  // wxPay Routes
  apiRoutes.use('/wx', wxPayRoutes);
  wxPayRoutes.post('/getPayParams', WxPayMiddleware.getPayParams);
  wxPayRoutes.post('/unifiedOrder', WxPayMiddleware.unifiedOrder);
  wxPayRoutes.post('/getPayParamsByPrepay', WxPayMiddleware.getPayParamsByPrepay);
  wxPayRoutes.post('/reverse', WxPayMiddleware.reverse);
  wxPayRoutes.post('/refund', WxPayMiddleware.refund);
  wxPayRoutes.post('/close', WxPayMiddleware.close);
  wxPayRoutes.post('/orderQuery', WxPayMiddleware.orderQuery);
  wxPayRoutes.post('/refundQuery', WxPayMiddleware.refundQuery);
  wxPayRoutes.post('/getAppParams', WxPayMiddleware.getAppParams);
  wxPayRoutes.post('/getAppParamsByPrepay', WxPayMiddleware.getAppParamsByPrepay);
  wxPayRoutes.post('/getNativeUrl', WxPayMiddleware.getNativeUrl);
  wxPayRoutes.post('/unifiedOrderNative', WxPayMiddleware.unifiedOrderNative);
  wxPayRoutes.post('/micropay', WxPayMiddleware.micropay);
  wxPayRoutes.get('/downloadBill', WxPayMiddleware.downloadBill);
  wxPayRoutes.get('/downloadFundflow', WxPayMiddleware.downloadFundflow);
  wxPayRoutes.post('/transfers', WxPayMiddleware.transfers);
  wxPayRoutes.post('/transfersQuery', WxPayMiddleware.transfersQuery);
  wxPayRoutes.post('/createInvoice', WxPayMiddleware.createInvoice);
  wxPayRoutes.post('/updateInvoice', WxPayMiddleware.updateInvoice);

  wxPayRoutes.post('/notify', WxPayMiddleware.wxmiddleware, WxPayMiddleware.notify);
  wxPayRoutes.post('/notifyRefund', WxPayMiddleware.wxmiddleware, WxPayMiddleware.notifyRefund);
  // Diagnosis Routes
  apiRoutes.use('/diagnosis', diagnosisRoutes);
  diagnosisRoutes.get('/', DiagnosisController.getAllDiagnosis);
  diagnosisRoutes.post('/', DiagnosisController.Create);
  diagnosisRoutes.post('/bulk', DiagnosisController.CreateMany);
  diagnosisRoutes.delete('/:diagnosisId', DiagnosisController.Delete);
  diagnosisRoutes.post('/filter', DiagnosisController.getByFilter);
  diagnosisRoutes.post('/search', DiagnosisController.getBySearch);
  diagnosisRoutes.get('/diagnosisId', DiagnosisController.getById);
  diagnosisRoutes.post('/update', DiagnosisController.Update);
  
  // Mail Routes
  apiRoutes.use('/mail', mailRoutes);
  mailRoutes.post('/all', MailController.getAllMail);
  mailRoutes.post('/', MailController.Create);
  mailRoutes.delete('/:mailId', MailController.Delete);
  mailRoutes.post('/filter', MailController.getByFilter);
  mailRoutes.get('/mailId', MailController.getById);
  mailRoutes.post('/update', MailController.Update);
  mailRoutes.post('/updateMany', MailController.UpdateMany);
  mailRoutes.post('/getPatientMails', MailController.getPatientMails);
  mailRoutes.post('/getProviderByFilter', MailController.getProviderByFilter);
  mailRoutes.post('/getPatientByFilter', MailController.getPatientByFilter);
  
  
  /* mailRoutes.post('/message', function(req,resp){
     //   console.log ('req.body.wechatID',req.body.wechatID)
        var filter={wechatID:"liangw7",
        appID:req.body.appID,//"wx1456c566ec3e6686",
        appSecret:req.body.appSecret//"8ada6bb8a95c8d79abf7a374688aa9cd"
       };
        const wclient = WechatClient.connect({
            appId: filter.appID,
            appSecret: filter.appSecret,
          });
          
          wclient.sendText(filter.wechatID, 'this is a test').catch(error => {
            console.log(error); // formatted error message
            //console.log(error.stack); // error stack trace
            //console.log(error.config); // axios request config
            //console.log(error.request); // HTTP request
            console.log(error.response); // HTTP response;
        });
    })*/

  mailRoutes.post('/message', function (req, resp) {

    var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
      req.body.appID + '&secret=' + req.body.appSecret;
    https.get(tokenUrl, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
        console.log('wechat access', body);
        var weCharUrl = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' +
          body.access_token;
        console.log('weCharUrl============================================', weCharUrl)
        var postData = {
          touser: req.body.openID,
          msgtype: "text",
          text: {
            content: req.body.message
          }
        };

        var options = {
          method: 'post',
          body: postData, // Javascript object
          json: true, // Use,If you are sending JSON data
          url: weCharUrl,
          headers: {
            // Specify headers, If any
          }
        }

        request(options, function (err, res, body) {
          console.log('message option', options)
          if (err) {
            console.log('Error :', err)
            return
          }
          console.log(' Body :', body)

        });

      });
    })

  });

  mailRoutes.post('/messageLink', function (req, resp) {

    var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' +
      req.body.appID + '&secret=' + req.body.appSecret;
    https.get(tokenUrl, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
        console.log('wechat access', body);
        var weCharUrl = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' +
          body.access_token;
        var postData = {
          touser: req.body.openID,
          msgtype: "news",
          news: {
            articles: [{
              title: req.body.title,
              description: req.body.message,
              url: req.body.url,
              picurl: req.body.picUrl,
            }]
          }
        };

        var options = {
          method: 'post',
          body: postData, // Javascript object
          json: true, // Use,If you are sending JSON data
          url: weCharUrl,
          headers: {
            // Specify headers, If any
          }
        }

        request(options, function (err, response, body) {
          console.log('message option', options)
          if (err) {
            console.log('Error :', err)
            return
          }
          
          resp.status('200').send(body)

        });

      });
    })

  });
  //   POST "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=30_fCvQpHlNUuuW4XFluNRGIxHkV_QsAy3LviPfrh-_ZFoCzTT2q8t72aklw7PCT9mOnzIBhffh99vqc6B1RezrKGq2Vft09x8ewWuEwslOnE24L52cqH9ReZNYjf3zzdmRF97PhSkMISq_LgXOXMObAFASHJ" -d '{"touser":"oN_YY01eqorRQ5_TFbUDEcM6yYx8","msgtype":"text","text":{"content":"Hello World"}}'
  // Problem Routes
  apiRoutes.use('/problem', problemRoutes);
  problemRoutes.get('/', ProblemController.getAllProblem);
  problemRoutes.post('/', ProblemController.Create);
  problemRoutes.post('/createMany', ProblemController.createMany);
  problemRoutes.delete('/:id', ProblemController.Delete);
  problemRoutes.post('/filter', ProblemController.getByFilter);
  problemRoutes.get('/id', ProblemController.getById);
  problemRoutes.post('/update', ProblemController.Update);
  problemRoutes.post('/getPatientProblems', ProblemController.getPatientProblems);


  //OrderItem Routes
  apiRoutes.use('/orderItem', orderItemRoutes);
  orderItemRoutes.post('/filter', OrderItemController.getByFilter);
  orderItemRoutes.post('/searchByFilter', OrderItemController.searchByFilter);
  orderItemRoutes.get('/', OrderItemController.getAll);
  orderItemRoutes.post('/', OrderItemController.Create);
  orderItemRoutes.delete('/:id', OrderItemController.Delete);

  orderItemRoutes.get('/:orderItemId', OrderItemController.getById);
  orderItemRoutes.post('/update', OrderItemController.Update);
  orderItemRoutes.post('/getMedicationForm', OrderItemController.getMedicationForm);
  orderItemRoutes.post('/getItems', OrderItemController.getItems);
  orderItemRoutes.post('/getMedications', OrderItemController.getMedications);
  orderItemRoutes.post('/checkDuplication', OrderItemController.checkDuplication);


  //LabItem Routes
  apiRoutes.use('/labItem', labItemRoutes);
  labItemRoutes.get('/', LabItemController.getAll);
  labItemRoutes.post('/', LabItemController.Create);
  labItemRoutes.delete('/:id', LabItemController.Delete);
  labItemRoutes.post('/filter', LabItemController.getByFilter);
  labItemRoutes.get('/:labItemId', LabItemController.getById);
  labItemRoutes.post('/update', LabItemController.Update);
  //ImageItem Routes
  apiRoutes.use('/imageItem', imageItemRoutes);
  imageItemRoutes.get('/', ImageItemController.getAll);
  imageItemRoutes.post('/', ImageItemController.Create);
  imageItemRoutes.delete('/:id', ImageItemController.Delete);
  imageItemRoutes.post('/filter', ImageItemController.getByFilter);
  imageItemRoutes.get('/id:imageItemId', ImageItemController.getById);
  imageItemRoutes.post('/update', ImageItemController.Update);

  // uploadDataRoutes
  apiRoutes.use('/uploadData', uploadDataRoutes);
  uploadDataRoutes.get('/', UploadDataController.getAll);
  uploadDataRoutes.post('/', UploadDataController.Create);
  //uploadDataRoutes.delete('/:id', UploadDataController.Delete);
  uploadDataRoutes.delete('/:uploadId', UploadDataController.Delete);
  uploadDataRoutes.post('/filter', UploadDataController.getByFilter);
  uploadDataRoutes.get('/id', UploadDataController.getById);
  uploadDataRoutes.post('/update', UploadDataController.Update);


  // Data Routes
  apiRoutes.use('/datas', dataRoutes);
  dataRoutes.get('/', DataController.getDatas);
  dataRoutes.post('/', DataController.Create);
  dataRoutes.delete('/:dataID', DataController.Delete);
  dataRoutes.post('/patient', DataController.getDatasByPatient);
  dataRoutes.post('/ob', DataController.getDatasByOb);
  dataRoutes.post('/visit', DataController.getDatasByVisit);
  dataRoutes.post('/order', DataController.getDatasByOrder);
  dataRoutes.post('/followup', DataController.getDatasByFollowup);
  dataRoutes.post('/filter', DataController.getDatasByFilter);
  dataRoutes.get('/dataId', DataController.getById);
  dataRoutes.post('/update', DataController.Update);
  dataRoutes.post('/getPatientsByFilter', DataController.getPatientsByFilter);
  dataRoutes.post('/getReport', DataController.getReport);
  dataRoutes.post('/getMultiReport', DataController.getMultiReport);
  dataRoutes.post('/createMany', DataController.createMany);
  dataRoutes.post('/getLastData', DataController.getLastData);
  
  //Report Routes
  apiRoutes.use('/reports', reportRoutes);
  reportRoutes.post('/', ReportController.Create);
  reportRoutes.delete('/:reportId', ReportController.Delete);
  reportRoutes.post('/filter', ReportController.getReportsByFilter);
  reportRoutes.get('/reportId', ReportController.getById);
  reportRoutes.post('/update', ReportController.Update);

  // followup Routes
  apiRoutes.use('/followups', followupRoutes);
  followupRoutes.get('/', FollowupController.getFollowups);
  followupRoutes.post('/', FollowupController.createFollowup);
  followupRoutes.delete('/:visitID', FollowupController.deleteFollowup);
  followupRoutes.get('/patient/:patientID', FollowupController.getFollowupsByPatient);
  followupRoutes.get('/provider/:providerID', FollowupController.getFollowupsByProvider);
  followupRoutes.post('/date', FollowupController.getFollowupsByDate);

  followupRoutes.get('/requester/:requesterID', FollowupController.getFollowupsByRequester);
  followupRoutes.post('/update', FollowupController.UpdateFollowup);


  // pathway Routes
  apiRoutes.use('/pathway', pathwayRoutes);
  pathwayRoutes.get('/', PathwayController.getPathway);
  pathwayRoutes.post('/', PathwayController.createPathway);
  pathwayRoutes.delete('/:pathwayID', PathwayController.deletePathway);
  pathwayRoutes.get('/patient/:patientID', PathwayController.getPathwayByPatient);
  pathwayRoutes.get('/provider/:providerID', PathwayController.getPathwayByProvider);
  pathwayRoutes.post('/visit', PathwayController.getPathwayByVisit);

  pathwayRoutes.get('/requester/:requesterID', PathwayController.getPathwayByRequester);
  pathwayRoutes.post('/update', PathwayController.UpdatePathway);

  // User Routes
  // requireAuth,AuthenticationController.roleAuthorization(roleList),
  apiRoutes.use('/users', userRoutes);
  userRoutes.post('/getUserByFatherId', UserController.getUserByFatherId);
  userRoutes.get('/', requireAuth, UserController.getUsers);
  userRoutes.get('/:User_id', UserController.getUserById);
  userRoutes.post('/', UserController.createUser);
  userRoutes.get('/role/:role', UserController.getUsersByRole);
  userRoutes.post('/profile', UserController.getUsersByProfile);
  userRoutes.post('/filter', UserController.getByFilter);
  userRoutes.post('/count', UserController.getCount);
  userRoutes.get('/email/:email', UserController.getUserByEmail);
  userRoutes.post('/dailyPatients', UserController.getDailyPatients);
  userRoutes.post('/monthlyPatients', UserController.getMonthlyPatients);
  userRoutes.post('/getProfilePhoto', UserController.getProfilePhoto);
  userRoutes.post('/getUserProfiles', UserController.getUserProfiles);
  userRoutes.post('/getProviders', UserController.getProviders);
  userRoutes.post('/getlabItems', UserController.getlabItems);
  userRoutes.post('/update', UserController.updateUser);
  userRoutes.post('/getCountByService', UserController.getCountByService);
  userRoutes.post('/getMonthlyPatientsByProvider', UserController.getMonthlyPatientsByProvider);
  userRoutes.delete('/:User_id', UserController.deleteUser);
  userRoutes.post('/getProviderMails', UserController.getProviderMails);
  userRoutes.post('/getPatientMails', UserController.getPatientMails);
  userRoutes.post('/getVisitsByProvider', UserController.getVisitsByProvider);
  userRoutes.post('/getPatientsByProfile', UserController.getPatientsByProfile);
  userRoutes.post('/getPatientsByProfileForPublish', UserController.getPatientsByProfileForPublish);
  userRoutes.post('/getWithDetailByFilter', UserController.getWithDetailByFilter);
  userRoutes.post('/getVisitsBySelectedProvider', UserController.getVisitsBySelectedProvider);
  userRoutes.post('/getPatientMailsFromProviders', UserController.getPatientMailsFromProviders);
  userRoutes.post('/wechat', UserController.getWechatAccess);
  userRoutes.post('/signature', UserController.getSignature);
  userRoutes.post('/wechatUserInfor', UserController.wechatUserInfor);
  userRoutes.post('/wechatLink', UserController.wechatLink);
  userRoutes.post('/wechatTicket', UserController.wechatTicket);
  userRoutes.post('/phone', UserController.getUserByPhone);
  userRoutes.post('/getUserByPhoneNoRole', UserController.getUserByPhoneNoRole);
  userRoutes.post('/getUsersByPhone', UserController.getUsersByPhone);
  userRoutes.post('/getUserByRoleNot', UserController.getUserByRoleNot);
  userRoutes.post('/checkEmailIsInUse', UserController.checkEmailIsInUse);
  userRoutes.post('/checkUserPassword', UserController.checkUserPassword);
  userRoutes.post('/updateUserPassword', UserController.updateUserPassword);
  userRoutes.post('/updateUserSomeParts', UserController.updateUserSomeParts);
  userRoutes.post('/getByRoleAndServiceID', UserController.getByRoleAndServiceID);
  userRoutes.post('/getAgeByProfile', UserController.getAgeByProfile);
  userRoutes.post('/getSexByProfile', UserController.getSexByProfile);
  userRoutes.post('/getPatientMonthlyRegister', UserController.getPatientMonthlyRegister);
  userRoutes.post('/getServiceByFilter', UserController.getServiceByFilter);
  
  // MedicalHistory Routes


  apiRoutes.use('/MedicalHistory', MedicalHistoryRoutes);
  MedicalHistoryRoutes.get('/:_id', MedicalHistoryController.getById);
  MedicalHistoryRoutes.post('/patient', MedicalHistoryController.getByPatient);
  MedicalHistoryRoutes.post('/Update', MedicalHistoryController.Update);
  MedicalHistoryRoutes.get('/', MedicalHistoryController.get);
  MedicalHistoryRoutes.post('/', MedicalHistoryController.create);
  MedicalHistoryRoutes.delete('/:ID', MedicalHistoryController.delete);
  MedicalHistoryRoutes.post('/photo', MedicalHistoryController.upload);
  MedicalHistoryRoutes.delete('/photo/:ID', MedicalHistoryController.deletePhoto);


  // note Routes
  apiRoutes.use('/note', noteRoutes);
  noteRoutes.get('/:noteId', NoteController.getById);
  noteRoutes.post('/patient', NoteController.getByPatient);
  noteRoutes.post('/visit', NoteController.getByVisit);
  noteRoutes.post('/Update', NoteController.Update);
  noteRoutes.get('/', NoteController.get);
  noteRoutes.post('/', NoteController.create);
  noteRoutes.delete('/:noteId', NoteController.delete);
  noteRoutes.post('/photo', NoteController.upload);
  noteRoutes.delete('/photo/:noteId', NoteController.deletePhoto);

  // note Routes
  apiRoutes.use('/screening', screeningRoutes);
  screeningRoutes.get('/:screeningId', ScreeningController.getById);
  screeningRoutes.post('/patient', ScreeningController.getByPatient);
  screeningRoutes.post('/visit', ScreeningController.getByVisit);
  screeningRoutes.post('/Update', ScreeningController.Update);
  screeningRoutes.get('/', ScreeningController.get);
  screeningRoutes.post('/', ScreeningController.create);
  screeningRoutes.delete('/:screeningId', ScreeningController.delete);
  screeningRoutes.post('/photo', ScreeningController.upload);
  screeningRoutes.delete('/photo/:screeningId', ScreeningController.deletePhoto);

  // Med Routes
  apiRoutes.use('/meds', MedRoutes);
  MedRoutes.get('/:medId', MedController.getById);
  MedRoutes.post('/patient', MedController.getByPatient);
  MedRoutes.post('/createMany', MedController.createMany);
  MedRoutes.post('/Update', MedController.Update);
  MedRoutes.get('/', MedController.get);
  MedRoutes.post('/filter', MedController.getByFilter);
  MedRoutes.post('/', MedController.create);
  MedRoutes.delete('/:medId', MedController.delete);
  MedRoutes.post('/getPatientmedications', MedController.getPatientmedications);

  // order Routes
  apiRoutes.use('/orders', orderRoutes);
  orderRoutes.get('/:orderId', OrderController.getById);
  orderRoutes.post('/patient', OrderController.getByPatient);
  orderRoutes.post('/visit', OrderController.getByVisit);
  orderRoutes.post('/type', OrderController.getByType);
  orderRoutes.post('/Update', OrderController.Update);
  orderRoutes.get('/', OrderController.get);
  orderRoutes.post('/', OrderController.create);
  orderRoutes.delete('/:orderId', OrderController.delete);
  orderRoutes.post('/filter', OrderController.getByFilter);
  orderRoutes.post('/getconsultsByService', OrderController.getconsultsByService);

  // Category Routes
  apiRoutes.use('/categories', CategoryRoutes);
  CategoryRoutes.get('/:categoryId', CategoryController.getById);
  CategoryRoutes.post('/patient', CategoryController.getByPatient);
  CategoryRoutes.post('/Update', CategoryController.Update);
  CategoryRoutes.get('/', CategoryController.get);
  CategoryRoutes.post('/', CategoryController.create);
  CategoryRoutes.get('/field/:field', CategoryController.getByField);
  CategoryRoutes.post('/filter', CategoryController.getByFilter);
  CategoryRoutes.post('/internalFilter', CategoryController.getInternalFilter);

  CategoryRoutes.post('/profiles', CategoryController.getProfiles);
  CategoryRoutes.get('/activityType/:activityType', CategoryController.getByActivityType);
  CategoryRoutes.get('/formType/:formType', CategoryController.getByFormType);
  CategoryRoutes.post('/fields', CategoryController.getByFields);
  CategoryRoutes.post('/orderMaster', CategoryController.getOrderMasters);
  CategoryRoutes.post('/getForm', CategoryController.getForm);
  CategoryRoutes.post('/getProblemForm', CategoryController.getProblemForm);
  CategoryRoutes.post('/getSummary', CategoryController.getSummary);
  CategoryRoutes.post('/getReport', CategoryController.getReport);
  CategoryRoutes.delete('/:categoryId', CategoryController.delete);
  CategoryRoutes.post('/getlabItems', CategoryController.getlabItems);
  CategoryRoutes.post('/getUserForm', CategoryController.getUserForm);
  CategoryRoutes.post('/getFormById', CategoryController.getFormById);
  CategoryRoutes.post('/bulk', CategoryController.CreateMany);
  CategoryRoutes.post('/getFormByType', CategoryController.getFormByType);
  
  // Request Routes
  apiRoutes.use('/Requests', RequestRoutes);
  RequestRoutes.post('/', RequestController.getRequestById);
  RequestRoutes.get('/', RequestController.getRequests);
  RequestRoutes.get('/:title', RequestController.getRequestsByPatient);

  RequestRoutes.post('/', RequestController.createRequest);
  RequestRoutes.delete('/:requestID', RequestController.deleteRequest);

  //images Routes
  apiRoutes.use('/images', imageRoutes);
  // imageRoutes.post('/',  ImageController.uploadImage);
  imageRoutes.post('/patient', ImageController.getByPatient);
  imageRoutes.post('/getImage', ImageController.getImage);
  imageRoutes.delete('/:imageId', ImageController.delete);
  imageRoutes.post('/filter', ImageController.getByFilter);
  imageRoutes.post('/', ImageController.create);
  imageRoutes.post('/update', ImageController.update);
  //labs Routes
  apiRoutes.use('/labs', labRoutes);
  // labRoutes.post('/upload',  LabController.uploadLab);
  labRoutes.post('/patient', LabController.getByPatient);
  labRoutes.post('/getLab', LabController.getLab);
  labRoutes.delete('/:labId', LabController.delete);
  
  labRoutes.post('/Update', LabController.Update);
  labRoutes.post('/', LabController.create);
  labRoutes.post('/visit', LabController.getByVisit);
  labRoutes.post('/filter', LabController.getByFilter);
  // Set up routes

  // AxiDB Routes
  apiRoutes.use('/axidb', axidbRoutes);
  axidbRoutes.post('/getSimpleDB', AxidbMiddlwware.getSimpleDB);
  axidbRoutes.post('/getCombineDB', AxidbMiddlwware.getCombineDB);
  axidbRoutes.post('/getComplexDB', AxidbMiddlwware.getComplexDB);

  // Invoice Routes
  apiRoutes.use('/invoices', invoiceRoutes);
  invoiceRoutes.get('/:orderId', InvoiceController.getByOrderId);
  invoiceRoutes.get('/patient/:patientId', InvoiceController.getByPatientId);
  invoiceRoutes.post('/', InvoiceController.create);
  invoiceRoutes.post('/update', InvoiceController.update);
  invoiceRoutes.get('/', InvoiceController.getInvoices);
  invoiceRoutes.post('/graphsql', InvoiceController.graphsql);
  invoiceRoutes.post('/aggs', InvoiceController.aggregate);
  invoiceRoutes.post('/find', InvoiceController.findInvoices);
  invoiceRoutes.post('/getInvoices', InvoiceController.getInvoices);
  invoiceRoutes.post('/amount', InvoiceController.getTotalAmount);

  apiRoutes.use('/shortMessage', shortMessageRoutes);
  shortMessageRoutes.post('/sendShortMessageForLogin', shortMessage.sendShortMessageForLogin);
  shortMessageRoutes.post('/sendShortMessageForReset', shortMessage.sendShortMessageForReset);
  shortMessageRoutes.post('/checkShortMessage', shortMessage.checkShortMessage);
  shortMessageRoutes.post('/sendShortMessageNotification', shortMessage.sendShortMessageNotification);

  apiRoutes.use('/schedule', scheduleRoutes);
  scheduleRoutes.post('/addSchedule', schedule.addSchedule);
  scheduleRoutes.post('/searchSchedule', schedule.searchSchedule);
  scheduleRoutes.post('/cancelSchedule', schedule.cancelSchedule);

  apiRoutes.use('/wx', wxRoutes);
  wxRoutes.get('/', WechatBoxController.setup);
  wxRoutes.post('/',WechatBoxController.getMessagee)
  

  app.use('/api', apiRoutes);

}