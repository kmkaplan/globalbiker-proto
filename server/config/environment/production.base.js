'use strict';

// Production specific configuration
// =================================
module.exports = {
    // Server IP
    ip: process.env.OPENSHIFT_NODEJS_IP ||
        process.env.IP ||
        undefined,

    // Server port
    port: process.env.OPENSHIFT_NODEJS_PORT ||
        process.env.PORT ||
        8080,

    // MongoDB connection options
    mongo: {
        uri: process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME ||
            'mongodb://mongodb/biketouringmap'
    },
    seedDB: true,
    mail: {
        contactRecipient: 'contact@globalbiker.org',
        smtpTransport: {
            // @see https://github.com/andris9/nodemailer-smtp-transport
            host: 'smtp.myprovider.com',
            port: 465,
            secure: true,
            auth: {
                user: 'admin@myprovider.com,
                pass: '
                password '
            }
        }
    }
};