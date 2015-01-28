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
    prodUrl: 'http://globalbiker.org',
    mail: {
        contactRecipient: 'contact@globalbiker.org',
        smtpTransport: {
            // @see https://github.com/andris9/nodemailer-smtp-transport
            host: 'smtp.myprovider.com',
            port: 465,
            secure: true,
            auth: {
                user: 'admin@myprovider.com,
                pass: 'password'
            }
        }
    }
};