var mongoose = require('mongoose');

var diagnosisSchema = new mongoose.Schema({

    name: {
        type: String
    },
    internalName: {
        type: String
    },
    level: {
        type: Number
    },
    subDiagnosisList: [],
    SubClass: {
        type: []
    },
    Meta: {
        type: []
    },
    Rubric: {
        type: []
    },
    chRubric: {
        type: []
    },
    SuperClass: {
        type: []
    },
    _code: {
        type: String
    },
    _kind: {
        type: String
    }

}, {
    timestamps: true
});

diagnosisSchema.index({ _code: "text" }); //{ "$**": "text" }

module.exports = mongoose.model('diagnosis', diagnosisSchema);