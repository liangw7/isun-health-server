var Note = require('../models/note');

exports.get = function (req, res, next) {

    Note.find(function (err, notes) {
        if (err) {
            res.send(err);
        }
        res.json(notes);
    });
}


exports.getById = function (req, res, next) {

    Note.findById({ _id: req.params.noteId }, function (err, note) {
        if (err) {
            res.send(err);
        }
        res.json(note);

    });
}

exports.getByPatient = function (req, res, next) {

    Note.find(req.body, function (err, data) {
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

    Note.find(req.body, function (err, data) {
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
    Note.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true },
        function (err, request) {
            if (err) {
                res.send(err);
            } else {
                res.json(request);
            }
        });
}

exports.create = function (req, res, next) {

    Note.create((req.body),
        function (err, note) {
            if (err) {
                res.send(err);
            }
            res.json(note);
        });
}

exports.delete = function (req, res, next) {

    Note.remove({
        _id: req.params.noteId
    }, function (err, note) {
        res.json(note);
    });

}

exports.deletePhoto = function (req, res, next) {

    Note.remove({
        _id: req.params.noteId
    }, function (err, note) {
        var path = '././Note/' + req.params.noteId + '.jpg'
        fs.unlink(path);
        res.json(note);
    });

}

exports.upload = function (req, res, next) {
    var newNote = req.body;

    Note.create(newNote, function (err, data) {

        if (err) {
            res.send(err);
        }
        console.log(data)
        var loadedfile = Buffer.from(req.body.profilePic, 'base64');
        // console.log(loadedfile)

        var path = '././note/' + data._id + '.jpg'
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



exports.getNote = function (req, res, next) {
    // console.log('imageId: ', req.body.imageId);
    var path = '././note/' + req.body.noteId + '.jpg'
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