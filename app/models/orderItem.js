var mongoose = require('mongoose');

var orderItemSchema = new mongoose.Schema({

    name: {
        type: String
    },
    internalName: {
        type: String
    },
    medicationName: {
        type: String
    },
    label: {
        type: Object
    },
    orderType: {
        type: String
    },
    medsClass: {
        type: Object
    },
    copyOrder: {
        type: []
    },
    specialty: {
        type: String
    },
    uom: {
        type: String
    },
    labs: [],
    images: [],
    forms: [],

    synonyms: {
        type: []
    },
    packageVolume: {
        type: String
    },
    packageType: {
        type: String
    },
    medForm: {
        type: String
    },
    dose: {
        type: String
    },
    allergyList: {
        type: []
    },
    items: {
        type: []
    },
    options: {
        type: []
    },
    obs: {
        type: []
    },
    coOrders: {
        type: []
    },
    conflictingOrders: {
        type: []
    },
    conflictingProblems: {
        type: []
    },
    educations: {
        type: []
    },
    validDays: {
        type: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('orderItem', orderItemSchema);