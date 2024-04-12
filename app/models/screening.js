var mongoose = require('mongoose');

var screeningSchema = new mongoose.Schema({
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
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('screening', screeningSchema);