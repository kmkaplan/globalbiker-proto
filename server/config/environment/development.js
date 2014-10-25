'use strict';

// Development specific configuration
// ==================================
module.exports = {
    // MongoDB connection options
    mongo: {
        uri: 'mongodb://localhost/biketouringmap-dev'
    },

    seedDB: true,
    downloadPhotosFromProd: false,
    resetAdminPassword: false,
    prodUrl: 'http://globalbiker.org'
};