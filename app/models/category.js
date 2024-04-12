var mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({

    name: {
        type: String
    },
    internalName: {
        type: String
    },
    label: {
        type: Object
    },
    gender: {
        type: String
    },
    education: {
        type: Object
    },
    type: {
        type: String
    },
    field: {
        type: String
    },
    mappingOb: {
        type: Object
    },
    mappingLab: {
        type: Object
    },
    formType: {
        type: String
    },
    formStyle: {
        type: String
    },

    singleSelection: {
        type: String
    },
    min: {
        type: Number
    },
    max: {
        type: Number
    },
    imageType: {
        type: String
    },
    activityType: {
        type: String
    },
    profileType: {
        type: String
    },
    problemType: {
        type: String
    },
    followupType: {
        type: String
    },
    orderType: {
        type: String
    },
    context: {
        type: String
    },
    uom: {
        type: String
    },
    orderMaster: {
        type: Object
    },
    isOrderMaster: {
        type: String
    },

    addLabs: {
        type: String
    },
    addMoreThanOnce: {
        type: String
    },
    allowDuplicate: {
        type: String
    },
    problemSet: {
        type: String
    },
    medicationSet: {
        type: String
    },
    formula: {
        type: String
    },

    image: {
        type: String
    },
    options: [],
    obs: [],
    obSets: [],
    labItems: [],
    //  activities: [],
    //  profiles: [],
    calculationItems: [],

    problemID: {
        type: String
    },
    medicationID: {
        type: String
    },
    qualityControlForm: { type: Object },
    labs: [],
    images: [],
    forms: [],
    patientLists: [],
    selectedObs: [],
    synonyms: {
        type: String
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
    resource: {
        type: String
    },
    route: {
        type: String
    },
    status: {
        type: String
    },
    profileUrl: {
        type: Object
    },
    desc: {
        type: Object
    },
    devices: [],
    counter: {
        type: Number
    },
    createdBy: {
        type: Object
    }



}, {
    timestamps: true
});

module.exports = mongoose.model('category', categorySchema);