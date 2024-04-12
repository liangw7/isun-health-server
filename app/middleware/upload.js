//const path = require('path');
const fs = require('fs');
const {
  promisify
} = require('util');

//const unlinkAsync = promisify(fs.unlink);
var multer = require('multer');

const DIR = '../uploads';

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(DIR);
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    //  console.log ('file', file.fieldname);
    cb(null, file.fieldname + '-' + file.originalname);
  }
});

exports.upload = multer({
  storage: storage
});

exports.getFile = function (req, res, next) {

  let filename = req.params.filename,

    root = DIR + '/';
  //   console.log ('dir', DIR)
  let options = {
    root: root,
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  res.sendFile(filename, options, (err) => {
    if (err) {
      next(err);
    } else {
      //   console.log('Sent:', filename);
    }
  });
}

exports.uploadFile = function (req, res) {
  if (!req.file) {
    //  console.log("No file received");
    return res.send({
      success: false
    });

  } else {
    console.log('file received');
    return res.send({
      success: true
    })
  }
}


/* var multer = require('multers');
 var storage = multer.diskStorage({
     destination: function(req, file, cb) {
         cb(null, 'uploads')
     },
     filename: function(req, file, cb) {
         cb(null, req.body.name + '-' + Date.now())
     }
 })
 var upload = multer({ storage: storage });*/
/*
app.post('/uploads', (req, res, next) => {
    var newImage = {
        filename: req.body.image.name,
        originalName: req.body.image.about,
        desc: req.body.image.about,
        patientID: req.body.patientID,
    };
    Image.create(newImage, function(err, data) {
        if (err) {
            res.send(err);
        }
        console.log(data)
        var loadedfile = Buffer.from(req.body.image.profilePic, 'base64');
        // console.log(loadedfile)
        var path = '././uploads/' + data._id + '.jpg'
            // console.log(path)
        fs.writeFile(path, req.body.profilePic, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("File saved successfully!");
        });
        res.json(data);
    });
});
app.get('/uploads', (req, res, next) => {
    // use lean() to get a plain JS object
    // remove the version key from the response
    Image.find({}, '-__v').lean().exec((err, images) => {
        if (err) {
            res.sendStatus(400);
        }
        // Manually set the correct URL to each image
        for (let i = 0; i < images.length; i++) {
            var img = images[i];
            img.url = req.protocol + '://' + req.get('host') + '/images/' + img._id;
        }
        res.json(images);
    })
});*/