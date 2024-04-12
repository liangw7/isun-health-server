var OrderItem = require('../models/orderItem');
const mongoose = require('mongoose');

exports.getAll = function (req, res, next) {
    console.log('OrderItem', OrderItem)
    OrderItem.find(function (err, OrderItem) {

        if (err) {
            res.send(err);
        }
        res.json(OrderItem);
    });
}


exports.getById = function (req, res, next) {

    console.log('OrderItemId', req.params.orderItemId)

    OrderItem.findById({ _id: req.params.orderItemId }, function (err, OrderItem) {
        if (err) {
            res.send(err);
        }
        res.json(OrderItem);
    });
}

exports.searchByFilter = function (req, res, next) {

    console.log('OrderItemId', req.params.orderItemId)

    OrderItem.find(req.body, { _id: 1, label: 1, obs: 1, orderType:1 }, function (err, OrderItem) {
        if (err) {
            res.send(err);
        }
        res.json(OrderItem);
    });
}

exports.getMedications = function (req, res, next) {

    pipeline = [
        { "$match": { "orderType": 'medication' } },
        {
            "$group": {
                _id: { medicationName: "$medicationName" },
                count: { $sum: 1 }
            },
        },
        {
            "$project": {
                medicationName: '$_id.medicationName',
            }
        },
    ];

    OrderItem.aggregate(
        pipeline,
        function (err, result) {

            if (err) {
                console.log(err);
            } else {
                res.json(result);
            }
        })


}
exports.getMedicationForm = function (req, res, next) {

    var patientType = 'patient';
    var visitType = 'visit';
    var obIDs = [];

    var medicationID = mongoose.Types.ObjectId(req.body.medicationID);
    console.log('medication._id-1', medicationID)

    pipeline = [
        { "$match": { "_id": medicationID } },
        { "$unwind": "$obs" },
        {
            "$lookup": {
                "let": { "id": "$obs._id" },
                "from": "categories",
                "pipeline": [
                    { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$id" }] } } }
                ],
                "as": "obs_doc"
            }
        },
        {
            "$unwind":
                '$obs_doc',
        },
        {
            '$project':
            {
                'addsIn': '$obs.addsIn',
                'index': '$obs.index',
                'singleSelection': '$obs_doc.singleSelection',
                'name': '$obs.name',
                'label': '$obs_doc.label',
                'options': '$obs_doc.options',
                'type': '$obs_doc.type',
                'context': '$obs_doc.context',
                '_id': '$obs_doc._id',
                'values': []

            }
        },
        { '$sort': { 'index': 1 } },

    ];

    OrderItem.aggregate(
        pipeline,
        function (err, result) {
            console.log('_id', req.body.formIDs)
            console.log('result', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        })


}

exports.checkDuplication = function (req, res, next) {

    //  var orderIDs=[];
    //  for (let orderID of req.body.orderIDs){
    //      orderIDs.push(mongoose.Types.ObjectId(orderID));
    //  };
    var activeStatus = 'active';
    pipeline = [
        { "$match": { "_id": mongoose.Types.ObjectId(req.body.orderID) } },

        {
            "$lookup": {
                "let": { "orderItemID": "$_id", "validDays": "$validDays" },
                "from": "orders",
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and":
                                    [{ "$eq": ["$status", activeStatus] },
                                    { "$eq": ["$patientID", req.body.patientID] },

                                    { "$eq": ["$orderItemID", { "$toString": "$$orderItemID" }] },
                                    {
                                        "$lte": [
                                            {
                                                "$divide":
                                                    [{
                                                        "$subtract":
                                                            [{ "$toDate": req.body.visitDate },
                                                            { "$toDate": "$createdAt" }
                                                            ]
                                                    },
                                                    1000 * 3600 * 24
                                                    ]

                                            },
                                            "$$validDays"

                                        ]
                                    }
                                    ]
                            }
                        }
                    }
                ],
                "as": "activeOrders"
            }
        },
    ];

    OrderItem.aggregate(pipeline,
        // cursor({ batchSize: 1000 }),
        function (err, result) {
            console.log('req.body', req.body)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });
}

exports.getItems = function (req, res, next) {
    var orderItemID = mongoose.Types.ObjectId(req.body.orderItemID);

    pipeline = [
        { "$match": { "_id": orderItemID } },
        { "$unwind": "$items" },
        {
            "$lookup": {
                "let": {
                    "obsID": "$items._id",
                    "context": "$items.context",
                    "mappingOb": "$items.mappingOb"
                },
                "from": "datas",
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$or": [
                                    {
                                        "$and": [
                                            {
                                                "$eq": ["$obID", { "$toString": "$$obsID" }]
                                            },
                                            {
                                                "$eq": ["$patientID", req.body.patientID]
                                            },
                                            {
                                                "$eq": ["$$context", 'patient']
                                            },

                                        ]
                                    },
                                    {
                                        "$and": [
                                            {
                                                "$eq": ["$obID", { "$toString": "$$obsID" }]
                                            },
                                            {
                                                "$eq": ["$patientID", req.body.patientID]
                                            },
                                            {
                                                "$eq": ["$visitID", req.body.visitID]
                                            },
                                            {
                                                "$eq": ["$$context", null]
                                            },
                                        ]
                                    },
                                    {
                                        "$and": [
                                            {
                                                "$eq": ["$obID", { "$toString": "$$obsID" }]
                                            },
                                            {
                                                "$eq": ["$patientID", req.body.patientID]
                                            },
                                            {
                                                "$eq": ["$visitID", req.body.visitID]
                                            },
                                            {
                                                "$eq": ["$$context", 'visit']
                                            },
                                        ]
                                    },
                                    {
                                        "$and": [
                                            {
                                                "$eq": ["$obID", { "$toString": "$$mappingOb._id" }]
                                            },
                                            {
                                                "$eq": ["$patientID", req.body.patientID]
                                            }
                                        ]
                                    },
                                ]
                            }
                        }
                    }
                ],
                "as": "items.patientData"
            }
        },
        {
            "$addFields": {
                "items.patientData":
                    { "$arrayElemAt": ["$items.patientData", -1] }
            }
        },
        {
            "$lookup": {
                "let": { "mappingLab": "$items.mappingLab" },
                "from": "labs",
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {
                                        "$eq": ["$labItemID", { "$toString": "$$mappingLab._id" }]
                                    },
                                    {
                                        "$eq": ["$patientID", req.body.patientID]
                                    },

                                    {
                                        "$gte": ["$$mappingLab.searchDays",
                                            {
                                                "$divide":
                                                    [{
                                                        "$subtract":
                                                            [{ "$toDate": req.body.visitDate },
                                                            { "$toDate": "$resultAt" }
                                                            ]
                                                    },
                                                    1000 * 3600 * 24
                                                    ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                "as": "items.labData"
            }
        },
        {
            "$addFields": {
                "items.labData":
                {
                    "$cond": {
                        if: { "$eq": ["$items.mappingLab.seiry", 0] },
                        then: { "$arrayElemAt": ["$items.labData", -1] },
                        else: { "$arrayElemAt": ["$items.labData", -2] },
                    }
                }
                //last element
            }
        },
        {
            "$addFields": {
                "items.values": { $ifNull: ["$items.patientData.values", []] }
            }
        },
        {
            "$addFields": {
                "items.patientData":
                {
                    "$cond": {
                        if: { '$eq': ["$items.type", "mapping lab"] },
                        then: "$items.labData",
                        else: "$items.patientData"

                    }
                }
            }
        },
        {
            "$addFields": {
                "items.value": { $ifNull: ["$items.patientData.value", ''] }
            }
        },
        {
            "$addFields": {
                "items.label": { $ifNull: ["$items.label", { ch: '$items.name', en: '' }] }
            }
        },
        {
            "$addFields": {
                "items.values":
                {
                    "$cond": {
                        if: {
                            "$and": [{ "$ne": ["$items.value", ''] },
                            { "$in": ["$items.type", ["number", "mapping ob", "mapping", "mapping lab"]] }
                            ]
                        },
                        then: {
                            "$map":
                            {
                                input: "$items.options",
                                as: "option",
                                in: {
                                    "$cond":
                                    {
                                        if: {
                                            "$and":
                                                [{ $gte: [{ "$toDecimal": "$items.value" }, "$$option.from"] },
                                                { $lt: [{ "$toDecimal": "$items.value" }, "$$option.to"] }
                                                ]
                                        },
                                        then: "$$option",
                                        else: null
                                    }
                                }
                            }
                        },
                        else: {
                            "$cond": {
                                if: {
                                    "$and": [
                                        { "$in": ["$items.type", ["list"]] }
                                    ]
                                },
                                then: {
                                    "$map":
                                    {
                                        input: "$items.options",
                                        as: "option",
                                        in: {
                                            "$cond":
                                            {
                                                if: {
                                                    "$and":
                                                        [{ "$in": ["$$option.text", "$obSets_doc.obs_doc.values"] }

                                                        ]
                                                },
                                                then: "$$option",
                                                else: null
                                            }
                                        }
                                    }
                                },
                                else: []

                            }
                        }

                    }
                }
            }
        },
        {
            "$addFields": {
                "items.values":
                {
                    $filter: {
                        input: "$items.values",
                        as: "item",
                        cond: { $ne: ["$$item", null] }
                    }
                }
            }
        },
        {
            "$unwind": {
                "path": '$items.values',
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$group": {
                _id: {
                    _id: "$_id",
                    name: "$name",
                    label: "$label",

                    obID: '$items._id',
                    obName: '$items.name',
                    obLabel: '$items.label',
                    obOptions: '$items.options',

                    obType: '$items.type',
                    obValue: '$items.value',

                    obContext: '$items.context',
                },
                obValues: { $push: '$items.values' },
            }
        },
        {
            "$project": {
                _id: '$_id._id',
                name: '$_id.name',
                label: '$_id.label',
                items: {
                    _id: '$_id.obID',
                    name: '$_id.obName',
                    label: '$_id.obLabel',
                    options: '$_id.obOptions',
                    type: '$_id.obType',
                    value: '$_id.obValue',
                    context: '$_id.obContext',
                    values: '$obValues',
                }
            }
        },
        {
            "$group":
            {
                _id: {
                    _id: "$_id",
                    name: "$name",
                    label: "$label"
                },
                items: { $push: '$items' },
            }
        },
        {
            "$project": {
                _id: '$_id._id',
                name: '$_id.name',
                label: '$_id.label',
                items: 1
            }
        },
    ];

    OrderItem.aggregate(
        pipeline,
        function (err, result) {
            console.log('req.body.orderItemID', req.body.orderItemID)
            console.log('result', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        })

}


exports.getByFilter = function (req, res, next) {

    console.log('orderItem', OrderItem)

    OrderItem.find(req.body, function (err, data) {
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

    OrderItem.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.Create = function (req, res, next) {

    OrderItem.create((req.body),
        function (err, OrderItem) {

            if (err) {
                res.send(err);
            }
            res.json(OrderItem);
        });
}

exports.Delete = function (req, res, next) {

    OrderItem.remove({
        _id: req.params.OrderItemId
    }, function (err, OrderItem) {
        res.json(OrderItem);
    });

}