var mongoose = require('mongoose');

var followupSchema = new mongoose.Schema({
    desc: {
        type: String
    },
    patientID: {
        type: String
    },
    type: {
        type: String
    },
    forms: [],

    visitID: {
        type: String
    },
    problemID: {
        type: String
    },
    date: {
        type: Number
    },

    month: {
        type: Number
    },
    year: {
        type: Number
    },




}, {
    timestamps: true
});

module.exports = mongoose.model('followup', followupSchema);