var mongoose = require('mongoose');

var pathwaySchema = new mongoose.Schema({
    desc: {
        type: String
    },
    patientID: {
        type: String
    },
    type: {
        type: String
    },
    form: {
        type: Object
    },
    visitID: {
        type: String
    },
    problemID: {
        type: String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('pathway', pathwaySchema);