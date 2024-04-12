var LabItem = require('../models/labItem');

exports.getAll = function (req, res, next) {

    LabItem.find(function (err, LabItem) {

        if (err) {
            res.send(err);
        }
        res.json(LabItem);
    });
}

exports.getById = function (req, res, next) {

    console.log('LabItemId', req.params.labItemId)

    LabItem.findById({ _id: req.params.labItemId }, function (err, LabItem) {

        if (err) {
            res.send(err);
        }
        res.json(LabItem);
    });
}


exports.getByFilter = function (req, res, next) {

    LabItem.find(req.body, function (err, data) {
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

    LabItem.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.Create = function (req, res, next) {

    LabItem.create((req.body),
        function (err, LabItem) {
            if (err) {
                res.send(err);
            }
            res.json(LabItem);
        });
}

exports.Delete = function (req, res, next) {

    LabItem.remove({
        _id: req.params.id
    }, function (err, LabItem) {
        res.json(LabItem);
    });

}