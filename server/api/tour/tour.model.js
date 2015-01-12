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
        required: 'Please fill user id'
    },
    title: {
        type: String,
        required: 'Please fill tour title',
        trim: true
    },
    color: {
        type: String,
        required: 'Please fill tour color',
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
            required: 'Please fill country geonames id'
        },
        name: {
            type: String,
            required: 'Please fill country name'
        },
        countryCode: {
            type: String,
            required: 'Please fill country code'
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
    geometry: {
        type: Object,
        index: '2dsphere'
    }
});

module.exports = mongoose.model('Tour', TourSchema);