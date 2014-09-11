'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SteppointSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    stepId: {
        type: Schema.ObjectId,
        ref: 'StepSchema',
        required: 'Please fill step id'
    },
    stepIndex: {
        type: Number,
        required: 'Please fill stepIndex'
    },
    latitude: {
        type: Number,
        required: 'Please fill latitude'
    },
    longitude: {
        type: Number,
        required: 'Please fill longitude'
    },
    elevation: {
        type: Number
    }
});

module.exports = mongoose.model('Steppoint', SteppointSchema);
