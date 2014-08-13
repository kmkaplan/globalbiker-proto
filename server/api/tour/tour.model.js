'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Step = require('../step/step.model');

var TourSchema = new Schema({
    title: {
        type: String,
        required: 'Please fill tour title',
        trim: true
    },
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
    steps: {
        type: [Step]
    }
});

module.exports = mongoose.model('Tour', TourSchema);