'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var InteresttypeSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    reference: {
        type: String,
        trim: true,
        required: 'Please fill reference'
    },
    color: {
        type: String,
        trim: true,
        required: 'Please fill color'
    },
    icon: {
        type: String,
        trim: true,
        required: 'Please fill icon'
    },
});

module.exports = mongoose.model('Interesttype', InteresttypeSchema);