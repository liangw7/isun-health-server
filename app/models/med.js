var mongoose = require('mongoose');

var medSchema = new mongoose.Schema({
    desc: {
        type: String
    },
    patientID: {
        type: String
    },
    providerID: {
        type: String
    },
    displayName: {
        type: String
    },
    name: {
        type: String
    },
    label: {
        type: Object
    },
    medicationItemID: {
        type: String
    },
    medicationItem: {
        type: Object
    },
    infor: {
        type: Object
    },
    status: {
        type: String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('med', medSchema);