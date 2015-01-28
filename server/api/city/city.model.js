'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CitySchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
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
        index: '2dsphere'
    },
    country: {
        type: Schema.ObjectId,
        required: true,
        ref: 'Country'
    }
});

module.exports = mongoose.model('City', CitySchema);