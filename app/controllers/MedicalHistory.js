var MedicalHistory = require('../models/MedicalHistory');

exports.get = function (req, res, next) {

    MedicalHistory.find(function (err, MedicalHistorys) {
        if (err) {
            res.send(err);
        }
        res.json(MedicalHistorys);
    });
}


exports.getById = function (req, res, next) {

    MedicalHistory.findById({ _id: req.params.MedicalHistory_id }, function (err, MedicalHistory) {

        if (err) {
            res.send(err);
        }
        res.json(MedicalHistory);
    });
}

exports.getByPatient = function (req, res, next) {

    MedicalHistory.find(req.body, function (err, data) {
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
    //$set: { "content": req.body.content }
    //console.log('req', req.body)
    MedicalHistory.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.create = function (req, res, next) {

    MedicalHistory.create((req.body),
        function (err, MedicalHistory) {
            if (err) {
                res.send(err);
            }
            res.json(MedicalHistory);
        });
}

exports.delete = function (req, res, next) {

    MedicalHistory.remove({
        _id: req.params.ID
    }, function (err, MedicalHistory) {
        res.json(MedicalHistory);
    });

}

exports.deletePhoto = function (req, res, next) {

    MedicalHistory.remove({
        _id: req.params.MedicalHistoryId
    }, function (err, MedicalHistory) {
        var path = '././medicalhistory/' + req.params.MedicalHistoryId + '.jpg'
        fs.unlink(path);
        res.json(MedicalHistory);
    });

}

exports.upload = function (req, res, next) {
    var newMedicalHistory = req.body;

    MedicalHistory.create(newMedicalHistory, function (err, data) {

        if (err) {
            res.send(err);

        }
        console.log(data)
        var loadedfile = Buffer.from(req.body.profilePic, 'base64');
        // console.log(loadedfile)

        var path = '././MedicalHistory/' + data._id + '.jpg'
        // console.log(path)
        fs.writeFile(path, req.body.profilePic, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("File saved successfully!");
        });
        res.json(data);
    });
}

exports.getMedicalHistory = function (req, res, next) {
    // console.log('imageId: ', req.body.imageId);
    var path = '././MedicalHistory/' + req.body.MedicalHistoryId + '.jpg'
    fs.readFile(path, function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log('data: ', data)
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.write(data);
        res.end();
    });

}