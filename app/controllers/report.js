var Report = require('../models/report');

exports.getReports = function (req, res, next) {

    Report.find(function (err, Reports) {

        if (err) {
            res.send(err);
        }
        res.json(Reports);

    });

}

exports.getReportsByFilter = function (req, res, next) {

    Report.find(req.body, function (err, Report) {
        if (err) {
            res.send(err);
            console.log(err);
        }
        //   console.log ('Report', Report)
        res.json(Report);

        var _send = res.send;
        var sent = false;
        res.send = function (Report) {
            if (sent) return;
            _send.bind(res)(Report);
            sent = true;
        };
        next();
    });
}

exports.getById = function (req, res, next) {

    Report.findById({ _id: req.params.ReportId }, function (err, Category) {
        if (err) {
            res.send(err);
        }
        res.json(Category);
    });
}

exports.Create = function (req, res, next) {
    //console.log('request', req.body)
    Report.create(req.body, function (err, Report) {
        if (err) {
            res.send(err);
        }
        res.json(Report);
    });
}

exports.Delete = function (req, res, next) {

    Report.remove({
        _id: req.params.ReportId
    }, function (err, Report) {
        res.json(Report);
    });
}


exports.Update = function (req, res, next) {

    Report.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}