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
        ref: 'StepSchema',
        required: 'Please fill step id'
    },
    latitude: {
        type: Number,
        required: 'Please fill latitude'
    },
    longitude: {
        type: Number,
        required: 'Please fill longitude'
    },
    type: {
        type: String,
        required: 'Please fill type'
    }
});

module.exports = mongoose.model('Interest', InterestSchema);