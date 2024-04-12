var Med = require('../models/med');
const mongoose = require('mongoose');
exports.get = function (req, res, next) {

    Med.find(function (err, Meds) {
        if (err) {
            res.send(err);
        }
        res.json(Meds);
    });
}

exports.createMany = function (req, res, next) {

    Med.insertMany((req.body),
        function (err, Meds) {
            if (err) {
                res.send(err);
            }
            res.json(Meds);
        });
}

exports.getById = function (req, res, next) {

    Med.findById({ _id: req.params.medId }, function (err, Med) {
        if (err) {
            res.send(err);
        }
        res.json(Med);
    });
}

exports.getByFilter = function (req, res, next) {

    Med.find(req.body, function (err, data) {
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

exports.getPatientmedications = function (req, res, next) {

    var pipeline = [
        { "$match": { "patientID": { '$in': [req.body.patientID] } } },
        {
            "$lookup": {
                "let": { "medicationItemID": "$medicationItemID" },
                "from": "orderitems",
                "pipeline": [
                    { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$medicationItemID" }] } } }
                ],
                "as": "medicationItem"
            }
        },
        { "$unwind": '$medicationItem' },

        { "$unwind": '$medicationItem.obs' },
        {
            "$lookup": {

                "let": { "obID": "$medicationItem.obs._id" },
                "from": "categories",
                "pipeline": [
                    { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$obID" }] } } }
                ],
                "as": "medicationItem.obs_doc"

            }
        },
        { "$unwind": '$medicationItem.obs_doc' },
        {
            "$lookup": {
                "let": {
                    "medicationItemID": "$medicationItem._id",
                    'obsID': '$medicationItem.obs._id'
                },
                "from": "datas",
                "pipeline": [
                    {
                        "$match":
                        {
                            "$expr": {
                                "$and": [
                                    {
                                        "$eq": [{ "$toString": "$obID" }, { "$toString": "$$obsID" }]
                                    },
                                    {
                                        "$eq": ["$patientID", req.body.patientID]
                                    },
                                    {
                                        "$eq": [{ "$toString": "$$medicationItemID" }, { "$toString": "$medicationItemID" }]
                                    },

                                ]
                            }
                        }
                    }
                ],
                "as": "medicationItem.obs_data"
            }
        },
        {
            "$unwind": {
                "path": '$medicationItem.obs_data',
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$addFields": {
                "medicationItem.obs.value": "$medicationItem.obs_data.value",
                "medicationItem.obs.values": "$medicationItem.obs_data.values",
                "medicationItem.obs.type": "$medicationItem.obs_doc.type",
                "medicationItem.obs.options": "$medicationItem.obs_doc.options",
                "medicationItem.obs.label": "$medicationItem.obs_doc.label",
                "medicationItem.obs.singleSelection": "$medicationItem.obs_doc.singleSelection",
            }
        },
        {
            "$addFields": {
                "medicationItem.obs.values": { $ifNull: ["$medicationItem.obs.values", []] }
            }
        },
        {
            "$addFields": {
                "medicationItem.obs.values":
                {
                    "$cond": {
                        if: {
                            "$and": [
                                { "$in": ["$medicationItem.obs.type", ["number"]] },
                                { "$gt": [{ "$size": "$medicationItem.obs.options" }, 0] },
                            ]
                        },
                        then: {
                            "$map":
                            {
                                input: "$medicationItem.obs.options",
                                as: "option",
                                in: {
                                    "$cond":
                                    {
                                        if: {
                                            "$and":
                                                [{ $gte: [{ "$toDecimal": "$medicationItem.obs.value" }, "$$option.from"] },
                                                { $lt: [{ "$toDecimal": "$medicationItem.obs.value" }, "$$option.to"] }
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
                                    "$and": [{ "$gt": [{ "$size": "$medicationItem.obs.values" }, 0] },
                                    { "$in": ["$medicationItem.obs.type", ["list"]] }
                                    ]
                                },
                                then: {
                                    "$map":
                                    {
                                        input: "$medicationItem.obs.options",
                                        as: "option",
                                        in: {
                                            "$cond":
                                            {
                                                if: {
                                                    "$and":
                                                        [{ "$in": ["$$option.text", "$medicationItem.obs.values"] }

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
            "$unwind": {
                "path": '$medicationItem.obs.values',
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$group": {
                '_id': {
                    _id: '$_id',
                    status: '$status',
                    name: '$medicationItem.name',
                    label: '$medicationItem.label',
                    medicationItemID: '$medicationItem._id',
                    obID: '$medicationItem.obs._id',
                    obName: '$medicationItem.obs.name',
                    obLabel: '$medicationItem.obs.label',
                    obSingleSelection: '$medicationItem.obs.singleSelection',
                    obType: '$medicationItem.obs.type',
                    obOptions: '$medicationItem.obs.options',
                    obIndex: '$medicationItem.obs.index',
                    obAddsIn: '$medicationItem.obs.addsIn',
                    obValue: '$medicationItem.obs.value',
                },
                obNumber: { '$sum': '$medicationItem.obs.values.number' },
                obValues: { '$push': '$medicationItem.obs.values' },
            }
        },
        {
            "$addFields": {
                "obValues":
                {
                    $filter: {
                        input: "$obValues",
                        as: "item",
                        cond: { $ne: ["$$item", null] }
                    }
                }
            }
        },
        {
            '$project': {
                _id: '$_id._id',
                status: '$_id.status',
                name: '$_id.name',
                label: '$_id.label',
                medicationItemID: '$_id.medicationItemID',

                ob: {
                    _id: '$_id.obID',
                    name: '$_id.obName',
                    label: '$_id.obLabel',
                    index: '$_id.obIndex',
                    singleSelection: '$_id.obSingleSelection',
                    type: '$_id.obType',
                    addsIn: '$_id.obAddsIn',
                    options: '$_id.obOptions',
                    value: '$_id.obValue',
                    number: '$obNumber',
                    values: '$obValues'
                }

            }
        },
        { '$sort': { 'ob.index': 1 } },
        {
            "$group": {
                _id: {
                    _id: '$_id',
                    status: '$status',
                    name: '$name',
                    label: '$label',
                    medicationItemID: '$medicationItemID',

                },
                obs: { '$push': '$ob' },
                obsNumber: { '$sum': '$ob.number' }
            }
        },
        {
            '$addFields': {
                obs: {
                    $map:
                    {
                        input: "$obs",
                        as: "ob",
                        in:
                        {
                            "$cond": {
                                if: { "$eq": ["$$ob.type", 'calculation'] },
                                then: {
                                    "value": "$obsSum",
                                    "_id": "$$ob._id",
                                    "name": "$$ob.name",
                                    "label": "$$ob.label",
                                    "type": "$$ob.type",
                                    "addsIn": "$$ob.addIn",
                                    "singleSelection": "$$ob.singleSlection",
                                    "options": "$$ob.options",
                                    "index": "$$ob.index",

                                    "values": {
                                        "$map":
                                        {
                                            input: "$$ob.options",
                                            as: "option",
                                            in: {
                                                "$cond":
                                                {
                                                    if: {
                                                        "$and":
                                                            [{ $gte: [{ "$toDecimal": "$obsSum" }, "$$option.from"] },
                                                            { $lt: [{ "$toDecimal": "$obsSum" }, "$$option.to"] }
                                                            ]
                                                    },
                                                    then: "$$option",
                                                    else: null
                                                }
                                            }
                                        }
                                    }
                                },
                                else: "$$ob"
                            }
                        }
                    }
                }
            }
        },
        {
            '$project': {
                _id: '$_id._id',
                name: '$_id.name',
                label: '$_id.label',
                status: '$_id.status',
                medicationItemID: '$_id.medicationItemID',
                obs: 1
            }
        },
    ]
    Med.aggregate(
        pipeline,
        function (err, result) {
            console.log('req.body.patientID', req.body.patientID)
            console.log('result', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        })

}

exports.getByPatient = function (req, res, next) {

    Med.find(req.body, function (err, data) {
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


exports.Update = function (req, res, next) {

    Med.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.create = function (req, res, next) {

    Med.create((req.body),
        function (err, Med) {
            if (err) {
                res.send(err);
            }
            res.json(Med);
        });
}

exports.delete = function (req, res, next) {

    Med.remove({
        _id: req.params.medId
    }, function (err, Med) {
        res.json(Med);
    });
}