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
};

 let transporter = nodemailer.createTransport(mailerOption)

transporter.sendMail({
    from: process.env.EMAIL_USERNAME,
    to: 'sandeep.kr977@gmail.com',
    subject: 'Test Mail',
    html: 'Text Mail------------',
}).then(res => console.log(res)).catch(err => console.log(err));