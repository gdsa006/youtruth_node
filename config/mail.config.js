let nodemailer = require('nodemailer');
require('dotenv').config();

let mailerOption = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    },
    tls:{
        ciphers:'SSLv3'
    }
};

module.exports = {
    transporter: nodemailer.createTransport(mailerOption),
    from: process.env.NOREPLAY
};