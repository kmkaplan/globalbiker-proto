'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var InterestSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: 'Please fill name',
        trim: true
    },
    description: {
        type: String,
        required: 'Please fill description',
        trim: true
    },
    stepId: {
        type: Schema.ObjectId,
        ref: 'StepSchema'
    },
    geometry: {
        type: Object,
        index: '2dsphere',
        required: 'Please fill geometry'
    },
    type: {
        type: String,
        required: 'Please fill type'
    },
    source: {
        type: String
    },
    priority: Number,
    photosIds: [{
        type: Schema.ObjectId,
        ref: 'PhotoSchema'
    }]
});

module.exports = mongoose.model('Interest', InterestSchema);