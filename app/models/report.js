var mongoose = require('mongoose');

var reportSchema = new mongoose.Schema({

    profileID: {
        type: String
    },
    patientID: {
        type: String
    },
    obSetID: {
        type: String
    },
    obXID: {
        type: String
    },
    obYID: {
        type: String
    },
    timeList: {
        type: []
    },
    dataSet: {
        type: []
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('report', reportSchema);