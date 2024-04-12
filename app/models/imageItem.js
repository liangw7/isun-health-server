var mongoose = require('mongoose');

var imageItemSchema = new mongoose.Schema({

    name: {
        type: String
    },
    label: {
        type: Object
    },
    internalName: {
        type: String
    },
    synonyms: {
        type: []
    },
    imageType: {
        type: String
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('imageItem', imageItemSchema);