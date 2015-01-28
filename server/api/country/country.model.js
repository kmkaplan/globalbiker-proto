'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CountrySchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    geonameId: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    countryCode: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Country', CountrySchema);