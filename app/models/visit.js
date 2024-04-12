var mongoose = require('mongoose');

var visitSchema = new mongoose.Schema({
 
    desc: {
        type: Object
    },
    patient: {
        type: Object
    },
    type: {
        type: String
    },
    status: {
        type: String
    },
    availableAtYear: {
        type: Number
    },
    availableAtMonth: {
        type: Number
    },
    availableAtDate: {
        type: Number
    },
    availableAtHours: {
        type: Number
    },
    availableAtMinutes: {
        type: Number
    },
    reservedAt: {
        type: Date
    },
    visitDate: {
        type: Date
    },
    createdBy: {
        type: Object
    },
    modifiedBy: {
        type: Object
    },
    service: {
        type: Object
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('visit', visitSchema);