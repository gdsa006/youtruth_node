const { form, errorFeedback } = require('../middleware')
const userService = require('../service/user.service');
const videoService = require('../service/video.service');
const router = require('express').Router();

module.exports = (csrf) => {

    // view
    // router.get('/view/profile', (req, res) => res.render('pages/user/profile', { name: 'Profile'}))
    // router.get('/view/profile/password/update', (req, res) => res.render('pages/user/update-profile-password', { name: 'Update Profile Password'}))
    // router.get('/view/profile/setting', (req, res) => res.render('pages/user/profile-setting', { name: 'Edit Profile'}))
    
    // api
    router.get('/user/profile', async(req, res) => {
        let result = await userService.getUserByIdOrEmail({email:res.locals.auth.email});
        return res.jsonp(result);
    })
    router.post('/logout', userService.logout);
    router.post('/profile/update', form.updateProfilePasswordOtp, errorFeedback, userService.updateProfile)
    router.post('/password/update', form.updateProfilePassword, errorFeedback, userService.updateProfilePassword);
    router.post('/password/update/otp', userService.updateProfilePasswordOtp);
    // router.get('/user/profile/img', userService.getProfileImage);


    
    router.post('/post/file/upload', async (req, res) => {
        let result = await videoService.uploadVideo(req.body, res.locals.auth);
        res.jsonp(result)
    });

    router.post('/update/bio-avatar', async (req, res) => {
        let result = await userService.updateBioAvatar({
            body: req.body, 
            email : res.locals.auth.email
        });
        res.jsonp(result)
    });

    router.post('/update/profile', async(req, res) => {
        let result = await userService.updatePrivateProfile({
            body: req.body, 
            email : res.locals.auth.email
        });
        return res.jsonp(result);
    })

    return router;
};