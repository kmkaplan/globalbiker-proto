'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TourSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: Schema.ObjectId,
        ref: 'UserSchema',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    reference: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    color: {
        type: String,
        required: true,
        trim: true,
        default: 'blue'
    },
    description: {
        type: String,
        trim: true
    },
    travelWith: {
        type: String
    },
    keywords: [{
        type: String
    }],
    country: {
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
    },
    priority: {
        type: Number,
        default: 1
    },
    photoId: {
        type: Schema.ObjectId,
        ref: 'PhotoSchema'
    },
    difficulty: {
        type: Number
    },
    interest: {
        type: Number
    },
    distance: Number,
    numberOfSteps: Number,
    geometry: {
        type: Object,
        index: '2dsphere'
    }
});

module.exports = mongoose.model('Tour', TourSchema);