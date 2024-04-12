var mongoose = require('mongoose');

var TodoSchema = new mongoose.Schema({
    Name: {
        type: String
    },
    title: {
        type: String
    },
    status: {
        type: String
    },
    type: {
        type: String
    },
    content: {
        type: String
    },
    patientID: {
        type: String
    },
    providerID: {
        type: String
    },
    providerIDs: [],
    requesterID: {
        type: String
    },
    messages: []
}, {
    timestamps: true
});

module.exports = mongoose.model('Todo', TodoSchema);