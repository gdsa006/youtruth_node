const userService = require('../service/user.service');
const { form, auth, errorFeedback } = require('../middleware')
let router = require('express').Router();

module.exports = (csrf) => {

    // view
    // router.get('/login', (req, res) => res.render('pages/auth/login',{ name: 'Login', nav : 'hide'}))
    // router.get('/register', (req, res) => res.render('pages/auth/register', { name: 'Registration', nav : 'hide'}))
    router.get('/view/send/reset/password/link', (req, res) => res.render('pages/auth/reset-password', {name:'Reset Password', nav : 'hide'}))
    router.get('/view/reset/password', csrf, userService.setNewPasswordView);
    
    // api
    router.post('/register', form.register, errorFeedback, userService.register)
    router.post('/login', form.login, errorFeedback, auth.authenticate)
    router.post('/send/reset/password/link', form.updateProfilePasswordOtp, errorFeedback, userService.resetPassword);
    router.post('/reset/password/submit',csrf, form.resetPassword, errorFeedback, userService.setNewPassword);
    
    return router;
}