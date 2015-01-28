'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new Schema({
  creationTime: {
        type: Date,
        default: Date.now
    },
    emailFrom: {
        type: String,
        required: true
    },
    emailTo: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'draft'
    }
});

module.exports = mongoose.model('Message', MessageSchema);