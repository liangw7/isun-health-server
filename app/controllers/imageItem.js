var ImageItem = require('../models/imageItem');

exports.getAll = function (req, res, next) {

    ImageItem.find(function (err, ImageItem) {

        if (err) {
            res.send(err);
        }

        res.json(ImageItem);
    });
}

exports.getById = function (req, res, next) {

    console.log('ImageItemId', req.params.imageItemId)

    ImageItem.findById({ _id: req.params.imageItemId }, function (err, ImageItem) {
        if (err) {
            res.send(err);
        }
        res.json(ImageItem);
    });
}


exports.getByFilter = function (req, res, next) {

    ImageItem.find(req.body, function (err, data) {
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

exports.Update = function (req, res, next) {

    ImageItem.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.Create = function (req, res, next) {

    ImageItem.create((req.body),
        function (err, ImageItem) {
            if (err) {
                res.send(err);
            }
            res.json(ImageItem);
        });
}

exports.Delete = function (req, res, next) {

    ImageItem.remove({
        _id: req.params.id
    }, function (err, ImageItem) {
        res.json(ImageItem);
    });
}