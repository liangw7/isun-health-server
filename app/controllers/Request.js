var Request = require('../models/Request');
var Todo = require('../models/todo');
var mongoose = require('mongoose');

exports.getRequests = function (req, res, next) {

    Request.find(function (err, data) {
        if (err) {
            res.send(err);
        }
        res.json(data);
        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    });
}

exports.getRequestsByPatient = function (req, res, next) {

    Request.find({ title: req.params.patientID }, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        res.json(data);
        console.log('res', data)
        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    });
}


exports.getRequestById = function (req, res, next) {

    Request.findById({ _id: req.body.Request_id }, function (err, data) {
        if (err) {
            res.send(err);
        }
        res.json(data);
        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    });
}

exports.createRequest = function (req, res, next) {
    //console.log(req.body);
    // var user = JSON.parse(req.body);
    Request.create({ title: 'rrr', content: 'wwww' }, function (err, data) {
        console.log(data);
        if (err) {
            res.send(err);
        }
        res.json(data);
    });
}

exports.deleteRequest = function (req, res, next) {

    Request.remove({
        _id: req.params.requestID
    }, function (err, data) {
        if (err) {
            res.send(err);
        }
        res.json(data);
        var _send = res.send;
        var sent = false;
        res.send = function (data) {
            if (sent) return;
            _send.bind(res)(data);
            sent = true;
        };
        next();
    });
}