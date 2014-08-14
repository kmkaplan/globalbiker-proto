'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StepSchema = new Schema({
    tour: {
        type: Schema.ObjectId,
        ref: 'TourSchema',
        required: 'Please fill tour'
    },
    difficulty: {
        type: Number,
        required: 'Please fill difficulty'
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
        latitude: {
            type: Number,
            required: 'Please fill cityFrom latitude'
        },
        longitude: {
            type: Number,
            required: 'Please fill cityFrom longitude'
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
        latitude: {
            type: Number,
            required: 'Please fill cityTo latitude'
        },
        longitude: {
            type: Number,
            required: 'Please fill cityTo longitude'
        }
    }
});

module.exports = mongoose.model('Step', StepSchema);
