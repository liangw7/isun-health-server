let Invoice = require('../models/invoice'),
    Util = require('../utils/util');

exports.getInvoices = (req, res, next) => {
    Invoice.find(req.body, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.json(data);
        }
    });
}

exports.getByOrderId = (req, res, next) => {
    Invoice.findOne({
        out_trade_no: req.params.orderId
    }, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.json(data);
        }
    });
}

exports.getByPatientId = (req, res, next) => {
    Invoice.find({
        patientId: req.params.patientId
    }, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.json(data);
        }
    });
}

exports.create = (req, res, next) => {
    console.log('request', req.body)
    Invoice.create(req.body, (err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.json(data);
        }
    });
}

exports.update = (req, res, next) => {
    console.log('request', req.body)
    Invoice.findByIdAndUpdate(req.body._id, {
        $set: req.body
    }, (err, request) => {
        if (err) {
            res.send(err);
        } else {
            res.json(request);
        }
    });
}

exports.graphsql = (req, res, next) => {
    Invoice.find(req.body.query,
        req.body.fields, (err, data) => {
            if (err) {
                // console.log(err);
                res.json({
                    code: 400,
                    message: err
                });
            }
            if (data) {
                res.json({
                    code: 200,
                    data: data
                })
            } else
                res.json({
                    code: 201,
                    message: 'records not found'
                });
        });
}

exports.aggregate = function (req, res, next) {
    let pipeline = req.body.pipeline;
    Invoice.aggregate(
        pipeline, (err, result) => {
            // console.log('result', result)
            if (err) {
                console.log(err);
            } else {
                res.json(result);
            }
        })
}

/* payload to search invoice
Paramters:
ID:  patientId, providerId,   // specify the particular payee or payer
code // status: 1-prepay, 2-paid, 3-refubd, 4-refunded, 7-transfered, 5-reversed, 6-closed 
Date range: time_end, time_refund, time_transfer, time_close, time_reverse
Example of payload
{
    "query": {
        "patientId": "5e3a4aa2999c5278112ec3a6",
        "code": 1,
        "time_end": ["2020-01-01", "2020-08-13"]  or "1y", "3m", "7d"
    },
    "fields": { custom fields },
    "page": 1,
    "limit": 10
}
*/

exports.findInvoices = (req, res, next) => {
    let qry = Util.json2mongosql(req.body.query),
        limit = req.body.limit || 10,
        skip = req.body.page || 1
    Invoice.find(qry,
        req.body.fields, {
        skip: limit * (skip - 1),
        limit: limit
    }, (err, data) => {
        if (err) {
            // console.log(err);
            res.json({
                code: 400,
                message: err
            });
        }
        if (data) {
            res.json({
                code: 200,
                data: data
            })
        } else
            res.json({
                code: 201,
                message: 'records not found'
            });
    });
}

/* payload to aggregate invoice  amount
Paramters:
ID:  patientId, providerId,   // specify the particular payee or payer
code // status: 1-prepay, 2-paid, 3-refubd, 4-refunded, 7-transfered, 5-reversed, 6-closed 
Date range: time_end, time_refund, time_transfer, time_close, time_reverse
aggs field: amount, refundfee, tranferfee
Example of payload
{
    "query": {
        "patientId": "5e3a4aa2999c5278112ec3a6",
        "code": 1,
        "time_end": ["2020-01-01", "2020-08-13"] or "1y", "3m", "7d"
    },
     "field": "amount",     // aggs field
     "groupby": "providerId" , //  patientId, providerId
    "limits": 5             // top N aggs result
}
*/


exports.getTotalAmount = (req, res, next) => {
    let qry = Util.json2mongosql(req.body.query),
        pipeline = [{
            $match: qry
        },
        {
            $group: {
                _id: `$${req.body.groupby}`,
                totalAmount: {
                    $sum: {
                        $toInt: `$${req.body.field}`
                    }
                },
                count: {
                    $sum: 1
                }
            }
        },
        {
            $limit: req.body.limits || 1
        }
        ]
    Invoice.aggregate(
        pipeline, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.json(data);
            }
        })
}