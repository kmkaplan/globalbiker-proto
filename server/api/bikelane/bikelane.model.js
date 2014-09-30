'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// from http://data.toulouse-metropole.fr/les-donnees/-/opendata/card/12544-reseau-cyclable-et-vert

var BikelaneSchema = new Schema({
    creationTime: {
        type: Date,
        default: Date.now
    },
    // "Nom_voie"
    name: {
        type: String,
        //required: 'Please fill name',
        trim: true
    },
    // "obs_type"
    type: {
        type: String,
        //required: 'Please fill name',
        trim: true
    },
    // "Revetement"
    surface: {
        type: String,
        //required: 'Please fill name',
        trim: true
    },
    //"code_insee"
    inseeCode: {
        type: String,
        //required: 'Please fill name',
        trim: true
    },
    geometry: {
        type: Object,
        index: '2dsphere'
    }
});

module.exports = mongoose.model('Bikelane', BikelaneSchema);