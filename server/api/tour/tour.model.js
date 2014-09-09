'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TourSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: Schema.ObjectId,
        ref: 'UserSchema',
        required: 'Please fill user id'
    },
    title: {
        type: String,
        required: 'Please fill tour title',
        trim: true
    },
    country: {
        geonameId: {
            type: Number,
            required: 'Please fill country geonames id'
        },
        name: {
            type: String,
            required: 'Please fill country name'
        },
        countryCode: {
            type: String,
            required: 'Please fill country code'
        }
    }
});

module.exports = mongoose.model('Tour', TourSchema);
