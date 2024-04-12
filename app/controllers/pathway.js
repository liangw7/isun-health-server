var Pathway = require('../models/pathway');

exports.getPathway = function (req, res, next) {

    Pathway.find(function (err, Pathway) {

        if (err) {
            res.send(err);
        }
        res.json(Pathway);
    });
}

exports.getPathwayByPatient = function (req, res, next) {

    Pathway.find({ patientID: req.params.patientID }, function (err, data) {
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
exports.getPathwayByProvider = function (req, res, next) {

    Pathway.find({ providerID: req.params.providerID }, function (err, data) {
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

exports.getPathwayByVisit = function (req, res, next) {
    console.log('req.body', req.body)
    Pathway.find(req.body, function (err, data) {
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

exports.getPathwayByRequester = function (req, res, next) {

    Pathway.find({ requesterID: req.params.requesterID }, function (err, data) {
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
exports.UpdatePathway = function (req, res, next) {

    console.log('request', req.body)
    Pathway.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.createPathway = function (req, res, next) {
    console.log('request', req.body)
    Pathway.create(req.body, function (err, Visit) {

        if (err) {
            res.send(err);
        }
        res.json(Visit);
    });
}

exports.deletePathway = function (req, res, next) {

    Pathway.remove({
        _id: req.params.pathwayID
    }, function (err, visit) {
        res.json(visit);
    });
}