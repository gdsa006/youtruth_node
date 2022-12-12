let path = require('path');

let template = path.join(__dirname,'..','mail-templates');

module.exports = {
    
    SIGNUP_OTP : path.join(template, 'sign-up-otp.html'),
    SIGNUP_SUCCESS : path.join(template, 'sign-up-success.html'),

    RESET_PASSWORD_LINK : path.join(template, 'reset-password-link.html'),
    UPDATE_PASSWORD_OTP: path.join(template, 'update-password-otp.html'),
    UPDATE_PASSWORD_SUCCESS: path.join(template, 'update-password-success.html'),

    CHANNEL_BLOCKED : path.join(template, 'channel-blocked.html'),
    CHANNEL_UNBLOCKED : path.join(template, 'channel-unblocked.html'),
    
    USER_BLOCKED : path.join(template, 'user-blocked.html'),
    USER_ACTIVATED : path.join(template, 'user-activated.html'),
    
    VIDEO_BLOCKED: path.join(template, 'video-blocked.html'),
    VIDEO_UNBLOCKED: path.join(template, 'video-unblocked.html'),
    VIDEO_PUBLISHED: path.join(template, 'video-published.html'),
    VIDEO_REJECTED: path.join(template, 'video-rejected.html'),
    VIDEO_UPLOADED: path.join(template, 'video-uploaded.html')
    
}