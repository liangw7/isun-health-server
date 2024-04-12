var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var RequestsSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Request', RequestsSchema);