var Mail = require('../models/mail');

exports.getAllMail = function (req, res, next) {
    console.log('all req.body', req.body)
    Mail.find(req.body, function (err, data) {
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
    }).sort({ "createdAt": -1 });
}


exports.getById = function (req, res, next) {
    console.log('mailId', req.params.mailId)
    Mail.findById({ _id: req.params.mailId }, function (err, Mail) {
        if (err) {
            res.send(err);
        }
        res.json(Mail);
    });
}

exports.getByFilter = function (req, res, next) {
 
    Mail.find(req.body, { _id: 1, 
        contentList: 1, 
        createdAt: 1, 
        patient: 1, 
        provider:1,
        status: 1,
        updatedAt:1, 
        user: 1  }, function (err, data) {
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
    }).sort({ "createdAt": -1 });;
}

exports.getProviderByFilter = function (req, res, next) {
 
    Mail.aggregate([
        // Match documents according to the initial criteria from req.body
        { $match: req.body },
        // Group documents by the unique combination of fields you're interested in
        {
            $group: {
                _id: { provider: "$provider", user: "$user" }, // Adjust according to which fields should define uniqueness
                // Include fields you want from the first document encountered in each group
                doc: { $first: "$$ROOT" }
            }
        },
        // Replace the root to promote the grouped document to the top level
        {
            $replaceRoot: { newRoot: "$doc" }
        },
        // Optionally, project only the fields you want to return
        {
            $project: {
                provider: 1,
                user: 1,
                status: 1
                // Add other fields as necessary
            }
        },
        // Sort the results if necessary
        { $sort: { "createdAt": -1 } }
    ], function (err, uniqueData) {
        if (err) {
            console.log(err);
            return res.send(err);
        }
        console.log('Unique data', uniqueData);
        res.json(uniqueData);
    });
}
exports.getPatientByFilter = function (req, res, next) {
 
    Mail.aggregate([
        // Match documents according to the initial criteria from req.body
        { $match: req.body },
        // Group documents by the unique combination of 'patient' and 'user' fields
        {
            $group: {
                _id: { patient: "$patient", user: "$user" }, // Grouping criteria
                // Use the first document found for each unique combination as the document to process
                doc: { $first: "$$ROOT" }
            }
        },
        // Replace the document at the root with the document stored in 'doc'
        {
            $replaceRoot: { newRoot: "$doc" }
        },
        // Project only the fields you're interested in
        {
            $project: {
                patient: 1,
                user: 1,
                status: 1
                // Include other fields as needed
            }
        },
        // Sort the documents by 'createdAt' in descending order
        { $sort: { "createdAt": -1 } }
    ], function (err, uniqueData) {
        if (err) {
            console.error(err);
            return res.send(err);
        }
        console.log('Unique data', uniqueData);
        res.json(uniqueData);
    });
    
}
exports.Update = function (req, res, next) {

    Mail.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.UpdateMany= function (req, res, next){
    Mail.updateMany(req.body.filter, req.body.update, function(err, result) {
        if (err) {
            res.send(err);
        } else {
            res.json(result);
        }
    });
}
exports.Create = function (req, res, next) {

    Mail.create((req.body),
        function (err, Mail) {
            if (err) {
                res.send(err);
            }
            res.json(Mail);
        });
}

exports.Delete = function (req, res, next) {

    Mail.remove({
        _id: req.params.mailId
    }, function (err, Mail) {
        res.json(Mail);
    });
}


exports.getPatientMails = function (req, res, next) {

    //find all patients of a provider
    var pipeline = [
        { "$match": { "$eq": [{ "$toString": "$patientID" }, req.body.patientID] } },
        { '$limit': req.body.limit },
        {
            "$addFields": {
                "newMails": {
                    "$map":
                    {
                        input: "$mails",
                        as: "mail",
                        in: {
                            "$cond": {
                                if: { '$eq': ["$status", "active"] }
                            },
                            then: "$$mail"
                        }
                    }

                }
            }
        },
        {
            "$addFields": {
                "newMailsCount": { "$size": "$newMails" }

            }
        },
    ]

    Data.aggregate(
        pipeline,
        function (err, result) {
            console.log('_id', req.body.patientListID)
            console.log('result', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        });
}