var mongoose = require('mongoose');

var mailSchema = new mongoose.Schema({

    status: {
        type: String
    },
    contentList: {
        type: []
    },
    user:{
        type:Object
    },
    provider:{
        type:Object
    },
    patient:{
        type:Object
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('mail', mailSchema);