var Diagnosis = require('../models/diagnosis');

exports.getAllDiagnosis = function (req, res, next) {

    Diagnosis.find(function (err, Diagnosis) {

        if (err) {
            res.send(err);
        }

        res.json(Diagnosis);

    });

}


exports.getById = function (req, res, next) {

    console.log('diagnosisId', req.params.DiagnosisId)

    Diagnosis.findById({ _id: req.params.diagnosisId }, function (err, Diagnosis) {

        if (err) {
            res.send(err);
        }
        res.json(Diagnosis);
    });
}

exports.getByFilter = function (req, res, next) {

    console.log('req.body.filter', req.body.filter)
    Diagnosis.find(req.body.filter, function (err, data) {
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

exports.getBySearch = function (req, res, next) {

    var pipeline = [
        // {"$match": {'$text': {'$search': "A" } }}
        {
            '$project': {
                Meta: 0,
                _kind: 0,
                subDiagnosisList: 0
            }
        },
        {
            "$match": {
                "$or": [
                    { "_code": { '$regex': req.body.filter.search } },
                    { 'Rubric': { '$elemMatch': { 'Label.__text': { '$regex': req.body.filter.search } } } },
                    { 'chRubric': { '$elemMatch': { 'Label.__Text': { '$regex': req.body.filter.search } } } },
                ]
            }
        },
        /*  {'$group':{
                      '_id':{'_id':'$_id',
                          'SuperClass':'$SuperClass',
                          '_code':'$_code',
                          'SubClass':'$SubClass',
  
                          },
                     'Rubric':{"$push":'$Rubric'},
                     'chRubric':{"$push":'$chRubric'}
                  }
              },
         {'$project':{
                  '_id':'$_id._id',
                  'SuperClass':'$_id.SuperClass',
                  '_code':'$_id._code',
                  'SubClass':'$_id.SubClass',
                  'Rubric':1,
                  'chRubric':1
              }},*/

    ]

    Diagnosis.aggregate(
        pipeline,
        function (err, result) {
            console.log('_id', req.body.filter.search)
            console.log('result', result)
            if (err) {
                console.log(err);
            }
            else {
                res.json(result);
            }
        })
}


exports.Update = function (req, res, next) {

    Diagnosis.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.Create = function (req, res, next) {

    Diagnosis.create((req.body),
        function (err, Diagnosis) {

            if (err) {
                res.send(err);
            }
            res.json(Diagnosis);
        });
}

exports.CreateMany = function (req, res, next) {

    Diagnosis.insertMany((req.body),
        function (err, Diagnosis) {

            if (err) {
                res.send(err);
            }

            res.json(Diagnosis);
        });
}

exports.Delete = function (req, res, next) {

    Diagnosis.remove({
        _id: req.params.diagnosisId
    }, function (err, Diagnosis) {
        res.json(Diagnosis);
    });

}