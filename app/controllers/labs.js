var Lab = require('../models/lab');
var mongoose = require('mongoose');
var fs = require('fs');


exports.getByFilter = function (req, res, next) {

    Lab.find(req.body, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        console.log('data', data)
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

exports.getByPatient = function (req, res, next) {
    console.log('patientid', req.body.patientID)
    Lab.find({ patientID: req.body.patientID }, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        res.json(data);
        console.log(data)
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

exports.getLab = function (req, res, next) {
    // console.log('imageId: ', req.body.imageId);
    var path = '././labs/' + req.body.labId + '.jpg'
    fs.readFile(path, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log('data: ', data)
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.write(data);
        res.end();
    });

}

exports.delete = function (req, res, next) {
    Lab.remove({
        _id: req.params.labId
    }, function (err, data) {

        var path = './././uploads/' + 'photo-' + req.params.labId + '.png';
       if(fs.existsSync(path)){
        fs.unlink(path, (err) => {
            if (err) {
                console.error(err)
                return
            }
            console.log('deleted', path)
            res.json(data);
        });
    }
    else{
        if (err) {
            res.send(err);
        } else {
            res.json(data);
        }
    }
    });
}


exports.Update = function (req, res, next) {

    Lab.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, lab) {
            if (err) {
                res.send(err);
            } else {
                res.json(lab);
            }
        });
}

exports.create = function (req, res, next) {

    Lab.create((req.body),
        function (err, lab) {

            if (err) {
                res.send(err);
            }
            res.json(lab);
        });
}

exports.getByVisit = function (req, res, next) {

    Lab.find(req.body, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);
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

