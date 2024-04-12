//let stream = require('stream');
const s3 = require('../../config/s3.config.js');

// GET api/s3file/:patientId/:filename
exports.doDownload = (req, res) => {
  const s3Client = s3.s3Client;
  const params = s3.downloadParams;

  params.Key = `${req.params.patientId}/${req.params.filename}`;
  s3Client.getObject(params)
    .createReadStream()
    .on('error', function (err) {
      res.status(500).json({
        code: 500,
        message: `Error: ${err}`
      });
    }).pipe(res);
}


// POST api/s3file/upload  params:  file and body.patientId
exports.doUpload = (req, res) => {
  const s3Client = s3.s3Client;
  const params = s3.uploadParams;
  params.Key = `${req.body.patientId}/${req.file.originalname}`;
  params.Body = req.file.buffer;

  const hparams = s3.headParams;
  hparams.Key = params.Key;

  s3Client.waitFor('objectExists', hparams, (err, data) => {
    if (err) {
      // console.log(err, err.stack); // an error occurred, not exist
      s3Client.upload(params, (err, data) => {
        if (err) {
          res.status(500).json({
            code: 500,
            message: `Error: ${err}`
          });
        }
        res.json({
          code: 200,
          message: `File uploaded successfully - s${req.file.originalname}`
        });
      });
    } else {
      // console.log(data); // successful response, file exists
      res.json({
        code: 201,
        message: `File already exists - s${req.file.originalname}`
      });
    }
  });

}