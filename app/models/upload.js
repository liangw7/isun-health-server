var mongoose = require('mongoose');

var uploadSchema = new mongoose.Schema({

    patientID: {
        type: String
    },
    obID: {
        type: String
    },
    visitID: {
        type: String
    },
    followupID: {
        type: String
    },
    source: {
        typ: String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('upload', uploadSchema);