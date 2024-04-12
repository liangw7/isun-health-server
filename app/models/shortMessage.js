var mongoose = require('mongoose');

var ShortMessageSchema = new mongoose.Schema({
    mobile: {
        type: String
    },
    num: {
        type: Number
    },
    time: {
        type: Date
    }
});

module.exports = mongoose.model('ShortMessage', ShortMessageSchema);