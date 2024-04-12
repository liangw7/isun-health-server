var mongoose = require('mongoose');

var noteSchema = new mongoose.Schema({
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
    userID: {
        type: String
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('note', noteSchema);