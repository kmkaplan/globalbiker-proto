'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MailingSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        required: 'Please fill email'
    }
});

module.exports = mongoose.model('Mailing', MailingSchema);
