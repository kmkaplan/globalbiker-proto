'use strict';

// Development specific configuration
// ==================================
module.exports = {
    // MongoDB connection options
    mongo: {
        uri: 'mongodb://localhost/biketouringmap-dev'
    },

    seedDB: true,
    downloadPhotosFromProd: true,
    prodUrl: 'http://globalbiker.org'
};