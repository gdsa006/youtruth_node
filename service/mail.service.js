let ejs = require('ejs');
let { transporter, from } = require('../config/mail.config');
let fs = require('fs');
let template = require('../enum/mailTemplate.enum');
let { MailAudit } = require('../database/model');
let mailStatus = require('../enum/mailStatus.enum');
let path = require('path');
let logger = require('../config/logger').getLogger('Mail Service');

let sendHtmlMail= async({to, subject, templateName, data}) => {    
    let mailAudit = undefined;
    try{
        mailAudit = await MailAudit.create({to:to,subject:subject });
        let text = fs.readFileSync(templateName, {encoding:'utf-8'});
        let html = ejs.render(text, data);
        let mail = await transporter.sendMail({
                    from: from,
                    to: to,
                    subject: subject,
                    html: html,
                    attachments: [{
                        filename: 'logo.png',
                        path: path.join(__dirname,'..','public','assets','images','logoti-simple.png'),
                        cid: 'tivideos.logo'
                    }]
                });
        logger.info(`Mail sent to ${to} with subject ${subject}`);
        // insert mail status into DB
        if(mailAudit)
            await mailAudit.update({messageId: mail.messageId, status: mailStatus.SUCCESS});
    }catch(err) {
        // insert mail status into DB
        logger.info(`Mail failed to ${to} with subject ${subject}`);
        if(mailAudit)
            await mailAudit.update({status: mailStatus.FAILED});
    }
}


module.exports = {
    sendResetPasswordLinkMail: async({email, username, resetLink}) => {
        await sendHtmlMail({
            to: email, 
            subject: 'RESET PASSWORD', 
            templateName: template.RESET_PASSWORD_LINK, 
            data: { username, resetLink }
        });
    },
    sendSignUpOtpMail: async({email, username, otp}) => {
        await sendHtmlMail({
            to: email, 
            subject: 'SIGNUP OTP', 
            templateName: template.SIGNUP_OTP, 
            data: { username, otp }
        });
    },
    sendSignUpSuccessMail: async({email, username}) => {
        await sendHtmlMail({
            to: email, 
            subject: 'SIGNUP SUCCESS', 
            templateName: template.SIGNUP_SUCCESS, 
            data: { username, email }
        });
    },
    sendUpdatePasswordOtpMail: async({email, username, otp}) => {
        await sendHtmlMail({
            to: email, 
            subject: 'UPDATE PASSWORD OTP', 
            templateName: template.UPDATE_PASSWORD_OTP, 
            data: { username, otp }
        });
    },
    sendUpdatePasswordSuccessMail: async({email, username}) => {
        await sendHtmlMail({
            to: email, 
            subject: 'UPDATE PASSWORD SUCCESS', 
            templateName: template.UPDATE_PASSWORD_SUCCESS, 
            data: { username }
        });
    },
    sendVideoBlockMail: async({email, username, channelName, videoName, uploadDate}) => {
        await sendHtmlMail({
            to: email, 
            subject: 'VIDEO BLOCKED', 
            templateName: template.VIDEO_BLOCKED, 
            data: { username, channelName, videoName, uploadDate }
        });
    },
    sendVideoUnBlockMail: async({email, username, channelName, videoName, uploadDate}) => {
        await sendHtmlMail({
            to: email, 
            subject: 'VIDEO UNBLOCKED', 
            templateName: template.VIDEO_UNBLOCKED, 
            data: { username, channelName, videoName, uploadDate }
        });
    },
    sendVideoPublishedMail: async({email, username, channelName, videoName, uploadDate}) => {
        await sendHtmlMail({
            to: email, 
            subject: 'VIDEO PUBLISHED', 
            templateName: template.VIDEO_PUBLISHED, 
            data: { username, channelName, videoName, uploadDate }
        });
    },
    sendVideoRejectedMail: async({email, username, channelName, videoName, uploadDate}) => {
        await sendHtmlMail({
            to: email, 
            subject: 'VIDEO REJECTED', 
            templateName: template.VIDEO_REJECTED, 
            data: { username, channelName, videoName, uploadDate }
        });
    },
    sendUserBlockedMail: async({email, username }) => {
        await sendHtmlMail({
            to: email, 
            subject: 'ACCOUNT BLOCKED', 
            templateName: template.USER_BLOCKED, 
            data: { username, email }
        });
    },
    sendUserActivatedMail: async({email, username }) => {
        await sendHtmlMail({
            to: email, 
            subject: 'ACCOUNT ACTIVATED', 
            templateName: template.USER_ACTIVATED, 
            data: { username, email }
        });
    },
    sendChannelBlockedMail: async({email, username, channelName, createDate}) => {
        await sendHtmlMail({
            to: email, 
            subject: 'CHANNEL BLOCKED', 
            templateName: template.CHANNEL_BLOCKED, 
            data: { username, channelName, createDate }
        });
    },
    sendChannelUnBlockedMail: async({email, username, channelName, createDate}) => {
        await sendHtmlMail({
            to: email, 
            subject: 'CHANNEL UNBLOCKED', 
            templateName: template.CHANNEL_UNBLOCKED, 
            data: { username, channelName, createDate }
        });
    }
}