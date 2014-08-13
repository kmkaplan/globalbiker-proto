'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StepSchema = new Schema({
    tour: {
        type: Schema.ObjectId,
        ref: 'TourSchema',
        required: 'Please fill tour'
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