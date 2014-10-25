'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PhotoSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        required: 'Please fill url'
    },
    thumbnails: {
        w600h400: {
            type: String,
            required: 'Please fill thumbnails w600h400'
        }
    },
    author: {
        name: String,
        url: String
    },
    licenseId: Schema.ObjectId,
    geometry: {
        type: Object,
        index: '2dsphere'
    }
});

module.exports = mongoose.model('Photo', PhotoSchema);