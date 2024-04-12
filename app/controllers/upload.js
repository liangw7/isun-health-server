var Upload = require('../models/upload');
var fs = require('fs');
exports.getAll = function (req, res, next) {

    Upload.find(function (err, Upload) {
        if (err) {
            res.send(err);
        }
        res.json(Upload);
    });
}

exports.getById = function (req, res, next) {

    //   console.log('uploadId', req.params.uploadId)

    Upload.findById({ _id: req.params.uploadId }, function (err, Upload) {
        if (err) {
            res.send(err);
        }
        res.json(Upload);
    });
}


exports.getByFilter = function (req, res, next) {

    //  console.log ('filter',req.body.filter)
    Upload.find(req.body.filter, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        //    console.log ('data', data)
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

exports.Update = function (req, res, next) {

    Upload.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.Create = function (req, res, next) {

    Upload.create((req.body),
        function (err, Upload) {
            if (err) {
                res.send(err);
            }
            res.json(Upload);
        });
}

/*exports.Delete = function (req, res, next) {
    console.log ('req', req)
    Upload.remove({
        _id: req.params.uploadId
    }, function (err, data) {
        console.log ('err', err)
        console.log ('data',data)
        var path = './././uploads/' + 'photo-' + req.params.uploadId + '.png';
        console.log ('path', path)
        fs.unlink(path, (err) => {
         
            if (err) {
                console.error(err)
                return
            }
            console.log('deleted', path)
            res.json(data);
        });
    });

}*/


exports.Delete = function (req, res, next) {
    var path = './././uploads/' + 'photo-' + req.params.uploadId + '.png';
    console.log('req.params', req.params)
    Upload.remove({
        _id: req.params.uploadId
    }, function (err, data) {
        fs.unlink(path, (err) => {
            if (err) {
                console.error(err)
                return
            }
            console.log('deleted', path)
            res.json(data);
        });
    });
}