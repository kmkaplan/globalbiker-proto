'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RegionSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: 'Please fill name',
        trim: true
    },
    reference: {
        type: String,
        required: 'Please fill reference',
        trim: true,
        unique: true
    },
    geometry: {
        type: Object,
        index: '2dsphere',
        required: 'Please fill geometry'
    }
});

module.exports = mongoose.model('Region', RegionSchema);