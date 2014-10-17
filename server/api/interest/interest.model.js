'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var InterestSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: 'Please fill name',
        trim: true
    },
    description: {
        type: String,
        required: 'Please fill description',
        trim: true
    },
    stepId: {
        type: Schema.ObjectId,
        ref: 'StepSchema'
    },
    latitude: {
        type: Number,
        required: 'Please fill latitude'
    },
    longitude: {
        type: Number,
        required: 'Please fill longitude'
    },
    geometry: {
        type: Object,
        index: '2dsphere'
    },
    type: {
        type: String,
        required: 'Please fill type'
    },
    source: {
        type: String
    },
    priority: Number,
    photos: [{
            url: {
                type: String,
                required: 'Please fill url'
            },
            thumbnail200: String,
            thumbnail400: String,
            thumbnail600: String,
            thumbnails: {
                w600: String,
                w600h400: {
                    type: String,
                    required: 'Please fill thumbnails.600'
                }
            },
            author: {
                name: String,
                url: String
            },
            licenseId: Schema.ObjectId
        }
    ]
});

module.exports = mongoose.model('Interest', InterestSchema);