var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    desc: {
        type: String
    },
    patientID: {
        type: String
    },
    type: {
        type: String
    },
    infor: {
        type: Object

    },
    visitID: {
        type: String
    },

    orderItemID: {
        type: String
    },
    serviceID: {
        type: String
    },

    providerID: {
        type: String
    },
    status: {
        type: String
    },
    startMonth: {
        type: Number
    },
    value: {
        type: Number
    },
    UOM: {
        type: String
    },
    createdBy: {
        type: Object
    },
    modifiedBy: {
        type: Object
    },
    visitDate: {
        type: Date
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('order', orderSchema);