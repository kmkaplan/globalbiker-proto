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
});

module.exports = mongoose.model('Interesttype', InteresttypeSchema);