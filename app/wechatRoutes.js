var express = require('express')

module.exports = function (app) {
    var apiRoutes = express.Router(),
        dddRoutes = express.Router();
    apiRoutes.use('/ddd', dddRoutes);
    console.log('here wechat test')
    dddRoutes.get('/', function (req, res) {
        res.redirect('http://www.digitalbaseas.com/api/ttt')
    });
    app.use('/', apiRoutes);
}