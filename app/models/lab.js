var mongoose = require('mongoose');

var LabSchema = new mongoose.Schema({

    desc: {
        type: String
    },
    name: {
        type: String
    },

    about: {
        type: String
    },
    patientID: {
        type: String
    },
    visitID: {
        type: String
    },
    orderID: {
        type: String
    },
    providerID: {
        type: String
    },
    obID: {
        type: String
    },
    labItemID: {
        type: String
    },
    displayName: {
        type: String
    },
    uploaded: {
        type: String
    },
    status: {
        type: String
    },
    value: {
        type: String
    },
    resultAt: {
        type: Date
    },
    enteredBy: {
        type: Object
    },
    values: [],
    UOM: {
        type: String
    },
    method: {
        type: String
    },
    createdBy: {
        type: Object
    },
    modifiedBy: {
        type: Object
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Lab', LabSchema);

//https://medium.com/@alvenw/how-to-store-images-to-mongodb-with-node-js-fb3905c37e6d