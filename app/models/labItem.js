var mongoose = require('mongoose');

var labItemSchema = new mongoose.Schema({

    name: {
        type: String
    },
    label: {
        type: Object
    },
    internalName: {
        type: String
    },
    options: [],
    uom: {
        type: String
    },
    labType: {
        type: String
    },
    synonyms: [],
    devices: []


}, {
    timestamps: true
});

module.exports = mongoose.model('labItem', labItemSchema);