var mongoose = require('mongoose');

var problemSchema = new mongoose.Schema({

    patientID: {
        type: String
    },

    patientEmail: {
        type: String
    },
    problemItemID: {
        type: String
    },
    problemItem: {
        type: Object
    },

    familyMembers: {
        type: []
    },
    familyMember: {
        type: String
    },
    role: {
        type: String
    },
    infor: {
        type: Object
    },
    label: {
        type: Object
    },
    primary: {
        type: Boolean
    },
    createdBy: {
        type: Object
    },
    modifiedBy: {
        type: Object
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('problem', problemSchema);