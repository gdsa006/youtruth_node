const videoService = require('../service/video.service');
const channelService = require('../service/channel.service');
const userService = require('../service/user.service');

const router = require('express').Router();

module.exports = (csrf) => {
    
    router.get('/stream/video', videoService.streamVideo);

    router.post('/video/details', async(req, res) => {
        let {hash } = req.body;
        let result = await videoService.getVideoByHash({ 
            hash,
            auth : res.locals.auth
        });
        return res.jsonp(result)
    });

    router.post('/video/basic-details', async(req, res) => {
        let {hash } = req.body;
        let result = await videoService.getBasicVideoDetailsByHash({ 
            hash
        });
        return res.jsonp(result)
    });

    router.get('/video/recommendation', async(req, res) => {
        let result = await videoService.getVideoRecommendation({
            hash: req.query.hash,
            page: req.query.page || 1,
            size: req.query.size || 4
        });
        return res.jsonp(result)
    });

    router.get('/video/categories', async (req, res) => {
        let result = await videoService.getVideoCategoryList();
        res.jsonp(result);
    })

    router.get('/video/category', async(req, res) => {
        let { page, size, categoryId, name } = req.query;
        let { auth } = res.locals;
        let result = await videoService.getVideosByCategoryIdOrLabel({
            page,
            size,
            categoryId,
            label: name,
            email: auth ? auth.email : undefined
        });
        return res.jsonp(result);
    });
    

    router.get('/get/channel/:id/videos', async (req, res) => {
        let result = await videoService.getVideosByChannelId({
            page: req.query.page,
            size: req.query.size,
            channelId: req.params.id
        });
        res.jsonp(result)
    })
    
    router.get('/get/channel/:id', async(req, res) => {
        let result = await channelService.getChannelById({
            channelId: req.params.id,
            active: true
        });
        res.jsonp(result)
    })

    router.get('/get/user/:id', async(req, res) => {
        let result = await userService.getUserByIdOrEmail({
            userId: req.params.id,
            active: true
        });
        res.jsonp(result)
    })

    // router.get('/get/user/:id/videos', async(req, res) => {
    //     let result = await videoService.getUserVideos({
    //         page: req.query.page,
    //         size: req.query.size,
    //         userId: req.params.id,
    //         active: true
    //     });
    //     res.jsonp(result)
    // })

    router.get('/get/user/:id/channels', async (req, res) => {
        let result = await channelService.getChannelsByUserId({
            page: req.query.page,
            size: req.query.size,
            userId : req.params.id
        });
        res.jsonp(result)
    });

    
    router.get('/fs/user/profile-image', userService.getProfileImage);

    router.get('/search', async(req, res) => {
        let { q, page, size } = req.query;
        if(q){
            let words = decodeURI(q.trim()).split(' ');
            let result = await videoService.searchVideo({words,all: true, page, size});
            return res.jsonp(result)
        } else {
            return res.jsonp({status:'success', data:{ records:[], count:0 }})
        }
    })

    router.get('/search/suggestions', async(req, res) => {
        let { q, page, size } = req.query;
        if(q){
            let words = decodeURI(q.trim()).split(' ');
            let result = await videoService.searchVideo({words, all: false, page, size});
            return res.jsonp(result)
        } else {
            return res.jsonp({status:'success', data:{ records:[], count:0 }})
        }
    })

    router.post('/mark/view', async(req, res) => {
        let { videoId } = req.body;
        let { auth } = res.locals;
        let result = await videoService.markView({videoId, req, auth });
        return res.jsonp(result);
    })

    router.post('/verify/sign-up/otp', async(req, res) => {
        let {email, otp} = req.body;
        let result = await userService.verifySignUpOtp({email, otp});
        return res.jsonp(result);
    })

    router.post('/resend/sign-up/otp', async(req, res) => {
        let {email} = req.body;
        let result = await userService.resendSignUpOtp({email});
        return res.jsonp(result);
    })
    return router;
}