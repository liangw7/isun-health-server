var Image = require('../models/image');
var mongoose = require('mongoose');
var fs = require('fs');

exports.uploadImage = function (req, res, next) {
    var newImage = req.body;
    /*{
        name: req.body.image.name,
        about: req.body.image.about,
        desc: req.body.image.desc,
        patientID: req.body.patientID,
        requestID: req.body.requestID,
    };*/

    Image.create(newImage, function (err, data) {

        if (err) {
            res.send(err);

        }
        console.log(data)
        var loadedfile = Buffer.from(req.body.profilePic, 'base64');
        // console.log(loadedfile)

        var path = '././images/' + data._id + '.jpg'
        // console.log(path)
        fs.writeFile(path, req.body.profilePic, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("File saved successfully!");
        });
        res.json(data);
    });
}

exports.getByFilter = function (req, res, next) {

    Image.find(req.body, function (err, data) {
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
    Image.find({ patientID: req.body.patientID }, function (err, data) {
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

exports.getImage = function (req, res, next) {
    // console.log('imageId: ', req.body.imageId);
    var path = '././images/' + req.body.imageId + '.jpg'
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
    var path = './././uploads/' + 'photo-' + req.params.imageId + '.png';
    console.log('req.params', req.params)
    Image.remove({
        _id: req.params.imageId
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

exports.create = function (req, res, next) {

    Image.create((req.body),
        function (err, lab) {

            if (err) {
                res.send(err);
            }
            res.json(lab);
        });
}

exports.update = function (req, res, next) {
    //$set: { "content": req.body.content }
    //console.log('req', req.body)
    Image.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}