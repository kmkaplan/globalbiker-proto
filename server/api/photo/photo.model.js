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
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    url: {
        type: String,
        required: 'Please fill url'
    },
    thumbnails: [{
        maxWidth: {
            type: Number,
            required: true
        },
        maxHeight: {
            type: Number,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
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