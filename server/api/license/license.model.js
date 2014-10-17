'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LicenseSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: 'Please fill name',
        trim: true
    },
    url: {
        type: String,
        required: 'Please fill url',
        trim: true
    },
});

module.exports = mongoose.model('License', LicenseSchema);