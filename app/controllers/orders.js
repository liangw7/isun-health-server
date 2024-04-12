var Order = require('../models/order');

exports.get = function (req, res, next) {

    Order.find(function (err, Orders) {

        if (err) {
            res.send(err);
        }
        res.json(Orders);
    });
}


exports.getById = function (req, res, next) {

    Order.findById({ _id: req.params.orderId }, function (err, Order) {
        if (err) {
            res.send(err);
        }
        res.json(Order);
    });
}

exports.getByPatient = function (req, res, next) {

    Order.find(req.body, function (err, data) {
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

exports.getByVisit = function (req, res, next) {

    Order.find(req.body, function (err, data) {
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

exports.getByType = function (req, res, next) {

    Order.find(req.body, function (err, data) {
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

exports.getByFilter = function (req, res, next) {

    Order.find(req.body, function (err, data) {
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

exports.getNameByFilter = function (req, res, next) {

    Order.find(req.body, { _id: 1, name: 1, label: 1 }, function (err, data) {
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

    Order.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.create = function (req, res, next) {

    Order.create((req.body),
        function (err, Order) {
            if (err) {
                res.send(err);
            }
            res.json(Order);
        });
}

exports.delete = function (req, res, next) {

    Order.remove({
        _id: req.params.OrderId
    }, function (err, Order) {
        res.json(Order);
    });

}

exports.getconsultsByService = function (req, res, next) {

    console.log('serviceID', req.body.serviceID);

    var pipeline = [{ $match: { serviceID: req.body.serviceID } },
    {
        "$lookup": {
            "let": { "patientID": "$patientID" },
            "from": "users",
            "pipeline": [
                { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$patientID" }] } } }
            ],
            "as": "patient"
        }
    },
    {
        "$lookup": {
            "let": { "providerID": "$providerID" },
            "from": "users",
            "pipeline": [
                { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$providerID" }] } } }
            ],
            "as": "provider"
        }
    },
    { "$unwind": '$patient' },
    { "$unwind": '$provider' },
    ];
    Order.aggregate(pipeline,
        // cursor({ batchSize: 1000 }),
        function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });
}



