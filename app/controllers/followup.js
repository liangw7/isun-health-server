var Followup = require('../models/followup');

exports.getFollowups = function (req, res, next) {

    Followup.find(function (err, Followup) {

        if (err) {
            res.send(err);
        }
        res.json(Followup);
    });
}

exports.getFollowupsByPatient = function (req, res, next) {

    Followup.find({ patientID: req.params.patientID }, function (err, data) {
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

exports.getFollowupsByProvider = function (req, res, next) {

    Followup.find({ providerID: req.params.providerID }, function (err, data) {
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

exports.getFollowupsByVisit = function (req, res, next) {
    console.log('req.body', req.body)
    Followup.find(req.body, function (err, data) {
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

exports.getFollowupsByRequester = function (req, res, next) {

    Followup.find({ requesterID: req.params.requesterID }, function (err, data) {
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

exports.getFollowupsByDate = function (req, res, next) {

    console.log('request', req.body)
    Followup.find(req.body, function (err, data) {
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

exports.UpdateFollowup = function (req, res, next) {

    Followup.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.createFollowup = function (req, res, next) {

    Followup.create(req.body, function (err, Visit) {

        if (err) {
            res.send(err);
        }
        res.json(Visit);
    });
}

exports.deleteFollowup = function (req, res, next) {

    Followup.remove({
        _id: req.params.FollowupID
    }, function (err, visit) {
        res.json(visit);
    });
}