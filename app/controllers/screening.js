var Screening = require('../models/screening');

exports.get = function (req, res, next) {

    Screening.find(function (err, Screenings) {

        if (err) {
            res.send(err);
        }
        res.json(Screenings);
    });
}


exports.getById = function (req, res, next) {

    Screening.findById({ _id: req.params.screeningId }, function (err, Screening) {
        if (err) {
            res.send(err);
        }
        res.json(Screening);
    });
}

exports.getByPatient = function (req, res, next) {

    Screening.find(req.body, function (err, data) {
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

    Screening.find(req.body, function (err, data) {
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
    Screening.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.create = function (req, res, next) {

    Screening.create((req.body),
        function (err, Screening) {
            if (err) {
                res.send(err);
            }
            res.json(Screening);
        });
}

exports.delete = function (req, res, next) {

    Screening.remove({
        _id: req.params.screeningId
    }, function (err, Screening) {
        res.json(Screening);
    });

}

exports.deletePhoto = function (req, res, next) {

    Screening.remove({
        _id: req.params.screeningId
    }, function (err, Screening) {
        var path = '././Screening/' + req.params.screeningId + '.jpg'
        fs.unlink(path);
        res.json(Screening);
    });

}

exports.upload = function (req, res, next) {
    var newScreening = req.body;

    Screening.create(newScreening, function (err, data) {
        if (err) {
            res.send(err);

        }
        console.log(data)
        var loadedfile = Buffer.from(req.body.profilePic, 'base64');
        // console.log(loadedfile)

        var path = '././Screening/' + data._id + '.jpg'
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



exports.getScreening = function (req, res, next) {
    // console.log('imageId: ', req.body.imageId);
    var path = '././Screening/' + req.body.screeningId + '.jpg'
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