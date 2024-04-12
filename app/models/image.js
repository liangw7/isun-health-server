var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({

    desc: {
        type: String
    },
    name: {
        type: String
    },

    displayName: {
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
    orderId: {
        type: String
    },
    providerId: {
        type: String
    },
    obSetID: {
        type: String
    },
    obID: {
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
    }

}, {
    timestamps: true
});
module.exports = mongoose.model('Image', ImageSchema);

//https://medium.com/@alvenw/how-to-store-images-to-mongodb-with-node-js-fb3905c37e6d