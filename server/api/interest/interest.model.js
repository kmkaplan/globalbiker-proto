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
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    stepId: {
        type: Schema.ObjectId,
        ref: 'StepSchema'
    },
    geometry: {
        type: Object,
        index: '2dsphere',
        required: true
    },
    type: {
        type: String,
        required: true
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