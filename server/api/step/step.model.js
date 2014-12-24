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
        required: 'Please fill tour'
    },
    description: {
        type: String,
        trim: true
    },
    difficulty: {
        type: Number,
        required: 'Please fill difficulty'
    },
    interest: {
        type: Number,
        required: 'Please fill interest'
    },
    photoId: {
        type: Schema.ObjectId,
        ref: 'PhotoSchema'
    },
    cityFrom: {
        geonameId: {
            type: Number,
            required: 'Please fill cityFrom geonames id'
        },
        name: {
            type: String,
            required: 'Please fill cityFrom name'
        },
        adminName1: {
            type: String,
            required: 'Please fill cityFrom adminName1'
        },
        geometry: {
            type: Object,
            index: '2dsphere',
            required: 'Please fill cityFrom geometry'
        }
    },
    cityTo: {
        geonameId: {
            type: Number,
            required: 'Please fill cityTo geonames id'
        },
        name: {
            type: String,
            required: 'Please fill cityTo name'
        },
        adminName1: {
            type: String,
            required: 'Please fill cityFrom adminName1'
        },
        geometry: {
            type: Object,
            index: '2dsphere',
            required: 'Please fill cityFrom geometry'
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

module.exports = mongoose.model('Step', StepSchema);