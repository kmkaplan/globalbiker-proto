'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var logger = require('../../components/logger/logger');

var StepSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    tourId: {
        type: Schema.ObjectId,
        ref: 'TourSchema',
        required: true
    },
    reference: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    difficulty: {
        type: Number,
        required: true
    },
    interest: {
        type: Number,
        required: true
    },
    photoId: {
        type: Schema.ObjectId,
        ref: 'PhotoSchema'
    },
    cityFrom: {
        geonameId: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        adminName1: {
            type: String,
            required: true
        },
        geometry: {
            type: Object,
            index: '2dsphere',
            required: true
        }
    },
    cityTo: {
        geonameId: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        adminName1: {
            type: String,
            required: true
        },
        geometry: {
            type: Object,
            index: '2dsphere',
            required: true
        }
    },
    distance: Number,
    elevationPoints: [{
        type: Number
    }],
    positiveElevationGain: Number,
    negativeElevationGain: Number,
    geometry: {
        type: Object,
        index: '2dsphere'
    }
});

StepSchema.index({tourId: 1, reference: 1}, {unique: true});

module.exports = mongoose.model('Step', StepSchema);