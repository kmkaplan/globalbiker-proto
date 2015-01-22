'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TourSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    region: {
        type: Schema.ObjectId,
        ref: 'Region',
        required: true
    },
    authors: [{
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    }],
    userId: {
        // TODO remove
        type: Schema.ObjectId,
        ref: 'User',
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
    status: {
        type: String,
        required: true,
        default: 'draft'
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
    cityFrom: {
        geonameId: {
            type: Number
        },
        name: {
            type: String
        },
        adminName1: {
            type: String
        },
        geometry: {
            type: Object,
            index: '2dsphere'
        }
    },
    cityTo: {
        geonameId: {
            type: Number
        },
        name: {
            type: String
        },
        adminName1: {
            type: String
        },
        geometry: {
            type: Object,
            index: '2dsphere'
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
    elevationPoints: [{
        type: Number
    }],
    positiveElevationGain: Number,
    negativeElevationGain: Number,
    geometry: {
        type: Object,
        index: '2dsphere'
    },
    sourceGeometry: {
        type: Object,
        index: '2dsphere'
    }
});

module.exports = mongoose.model('Tour', TourSchema);