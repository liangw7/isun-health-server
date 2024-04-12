var Problem = require('../models/problem');
var Meds = require('../models/med');
const mongoose = require('mongoose');

exports.getAllProblem = function (req, res, next) {

    Problem.find(function (err, Problem) {

        if (err) {
            res.send(err);
        }
        res.json(Problem);
    });
}

exports.createMany = function (req, res, next) {

    Problem.insertMany((req.body),
        function (err, problem) {
            if (err) {
                res.send(err);
            }
            res.json(problem);
        });
}

exports.getById = function (req, res, next) {
    //   console.log('ProblemId', req.params.id)

    Problem.findById({ _id: req.params.id }, function (err, Problem) {
        if (err) {
            res.send(err);
        }
        res.json(Problem);
    });
}


exports.getByFilter = function (req, res, next) {
    // console.log ('filter',req.body.filter)
    Problem.find(req.body.filter, function (err, data) {
        if (err) {
            res.send(err);
            console.log(err);

        }
        //    console.log ('data', data)
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

    Problem.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.Create = function (req, res, next) {

    Problem.create((req.body),
        function (err, Problem) {
            if (err) {
                res.send(err);
            }
            res.json(Problem);
        });
}

exports.getPatientProblems = function (req, res, next) {

    var pipeline = [
        { "$match": { "patientID": req.body.patientID } },
        {
            "$lookup": {

                "let": { "problemItemID": "$problemItemID" },
                "from": "categories",
                "pipeline": [
                    {
                        "$match": {
                            "$expr":
                                { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$problemItemID" }] }
                        }
                    }
                ],
                "as": "problemItem"
            }
        },
        { "$unwind": '$problemItem' },
        { "$unwind": '$problemItem.obs' },
        {
            "$lookup": {

                "let": { "obID": "$problemItem.obs._id" },
                "from": "categories",
                "pipeline": [
                    { "$match": { "$expr": { "$eq": [{ "$toString": "$_id" }, { "$toString": "$$obID" }] } } }
                ],
                "as": "problemItem.obs_doc"

            }
        },
        { "$unwind": '$problemItem.obs_doc' },
        {
            "$lookup": {
                "let": {
                    "problemItemID": "$problemItemID",
                    'familyMember': '$familyMember',
                    'obsID': '$problemItem.obs._id'
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
                                        "$eq": [{ "$toString": "$$problemItemID" }, { "$toString": "$problemItemID" }]
                                    },
                                    {
                                        "$or": [
                                            {
                                                "$eq": ["$$familyMember", "$familyMember"]
                                            },
                                            {
                                                "$eq": ["$familyMember", null]
                                            },
                                            {
                                                "$eq": ["$familyMember", 'self']
                                            },
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                "as": "problemItem.obs_data"
            }
        },
        {
            "$unwind": {
                "path": '$problemItem.obs_data',
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$addFields": {
                "problemItem.obs.value": "$problemItem.obs_data.value",
                "problemItem.obs.values": "$problemItem.obs_data.values",
                "problemItem.obs.type": "$problemItem.obs_doc.type",
                "problemItem.obs.options": "$problemItem.obs_doc.options",
                "problemItem.obs.label": "$problemItem.obs_doc.label",
                "problemItem.obs.singleSelection": "$problemItem.obs_doc.singleSelection",
            }
        },
        {
            "$addFields": {
                "problemItem.obs.values": { $ifNull: ["$problemItem.obs.values", []] }
            }
        },
        {
            "$addFields": {
                "problemItem.obs.values":
                {
                    "$cond": {
                        if: {
                            "$and": [
                                { "$in": ["$problemItem.obs.type", ["number"]] },
                                { "$gt": [{ "$size": "$problemItem.obs.options" }, 0] },
                            ]
                        },
                        then: {
                            "$map":
                            {
                                input: "$problemItem.obs.options",
                                as: "option",
                                in: {
                                    "$cond":
                                    {
                                        if: {
                                            "$and":
                                                [{ $gte: [{ "$toDecimal": "$problemItem.obs.value" }, "$$option.from"] },
                                                { $lt: [{ "$toDecimal": "$problemItem.obs.value" }, "$$option.to"] }
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
                                    "$and": [{ "$gt": [{ "$size": "$problemItem.obs.values" }, 0] },
                                    { "$in": ["$problemItem.obs.type", ["list"]] }
                                    ]
                                },
                                then: {
                                    "$map":
                                    {
                                        input: "$problemItem.obs.options",
                                        as: "option",
                                        in: {
                                            "$cond":
                                            {
                                                if: {
                                                    "$and":
                                                        [{ "$in": ["$$option.text", "$problemItem.obs.values"] }

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
                "path": '$problemItem.obs.values',
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            "$group": {
                '_id': {
                    _id: '$_id',
                    name: '$problemItem.name',
                    label: '$problemItem.label',
                    primary: '$primary',
                    problemItemID: '$problemItem._id',
                    familyMember: '$familyMember',
                    familyMembers: '$familyMembers',
                    obID: '$problemItem.obs._id',
                    obName: '$problemItem.obs.name',
                    obLabel: '$problemItem.obs.label',
                    obSingleSelection: '$problemItem.obs.singleSelection',
                    obType: '$problemItem.obs.type',
                    obOptions: '$problemItem.obs.options',
                    problemType: '$problemItem.problemType',
                    obIndex: '$problemItem.obs.index',
                    obAddsIn: '$problemItem.obs.addsIn',
                    obValue: '$problemItem.obs.value',
                },
                obNumber: { '$sum': '$problemItem.obs.values.number' },
                obValues: { '$push': '$problemItem.obs.values' },
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
                name: '$_id.name',
                label: '$_id.label',
                primary: '$_id.primary',
                problemItemID: '$_id.problemItemID',
                problemType: '$_id.problemType',
                familyMember: '$_id.familyMember',
                familyMembers: '$_id.familyMembers',
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
        {
            "$group": {
                _id: {
                    _id: '$_id',
                    name: '$name',
                    label: '$label',
                    primary: '$primary',
                    problemItemID: '$problemItemID',
                    familyMember: '$familyMember',
                    familyMembers: '$familyMembers',
                    problemType: '$problemType',
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
                primary: '$_id.primary',
                problemItemID: '$_id.problemItemID',
                problemType: '$_id.problemType',
                familyMember: '$_id.familyMember',
                familyMembers: '$_id.familyMembers',
                obs: 1
            }
        },
    ];

    Problem.aggregate(
        pipeline,
        function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        })
}

exports.Delete = function (req, res, next) {

    Problem.remove({
        _id: req.params.id
    }, function (err, Problem) {
        res.json(Problem);
    });

}