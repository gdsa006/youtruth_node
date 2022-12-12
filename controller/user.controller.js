const { form, errorFeedback } = require('../middleware')
const userService = require('../service/user.service');
const channelService = require('../service/channel.service');
const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const videoService = require('../service/video.service');

module.exports = (csrf) => {

    router.post('/post/channel', form.createChannel, errorFeedback, channelService.postCreateChannel);
    
    router.get('/get/channel/:id/videos', async (req, res) => {
        let { email } = res.locals.auth;
        let result = await videoService.getMyVideosByChannelId({
            page: req.query.page,
            size: req.query.size, 
            email,
            channelId: req.params.id
        });
        res.jsonp(result)
    });

    router.get('/get/channels', async (req, res) => {
        let result = await channelService.getMyChannel({
            page: req.query.page,
            size: req.query.size, 
            email : res.locals.auth.email
        });
        res.jsonp(result)
    });

    router.get('/get/channel/:id', async (req, res) => {
        let result = await channelService.getMyChannelById({
            channelId: req.params.id,
            email : res.locals.auth.email
        });
        res.jsonp(result)
    });


    router.get('/get/channels-name/list', channelService.getUsersChannelName);

    router.post('/post/video', async (req, res) => {
        let result = await videoService.saveVideoEntry(req.body, res.locals.auth.email);
        res.jsonp(result);
    });

    
    router.post('/video/like', async(req, res) => {
        let result = await videoService.doLike({hash: req.body.videoHash, email: res.locals.auth.email, doLike : true});
        res.jsonp(result)
    })

    router.post('/video/unlike', async(req, res) => {
        let result = await videoService.doLike({hash: req.body.videoHash, email: res.locals.auth.email, doLike : false});
        res.jsonp(result)
    })

    router.post('/video/subscribe', async(req, res) => {
        let result = await videoService.subscribe({channelId: req.body.channelId, email: res.locals.auth.email, subscribe : true});
        res.jsonp(result)
    })

    router.post('/video/unsubscribe', async(req, res) => {
        let result = await videoService.subscribe({channelId: req.body.channelId, email: res.locals.auth.email, subscribe : false});
        res.jsonp(result)
    })

    router.post('/video/mark-watch-later', async(req, res) => {
        let result = await videoService.watchLater({hash: req.body.videoHash, email: res.locals.auth.email, mark : true});
        res.jsonp(result)
    })

    router.post('/video/unmark-watch-later', async(req, res) => {
        let result = await videoService.watchLater({hash: req.body.videoHash, email: res.locals.auth.email, mark : false});
        res.jsonp(result)
    })


    router.get('/video/category', async(req, res) => {
        let { page, size, categoryId, name } = req.query;
        let {email } = res.locals.auth;
        let result = await videoService.getVideosByCategoryIdOrLabel({
            page,
            size,
            categoryId,
            label: name,
            email
        });
        return res.jsonp(result);
    });

    router.post('/delete/video', async(req, res) => {
        let { hash } = req.body;
        let {email } = res.locals.auth;
        let result = await videoService.deleteVideo({
            hash,
            email
        });
        return res.jsonp(result);
    });

    router.post('/delete/channel', async(req, res) => {
        let {email } = res.locals.auth;
        let result = await channelService.deleteChannel({
            channelId : req.body.channelId,
            email
        });
        return res.jsonp(result);
    });


    router.post('/update/video', async(req, res) => {
        let {email } = res.locals.auth;
        let result = await videoService.updateVideo({
            body: req.body,
            email
        });
        return res.jsonp(result);
    });

    router.post('/update/channel', async(req, res) => {
        let {email } = res.locals.auth;
        let result = await channelService.updateChannel({
            body: req.body,
            email
        });
        return res.jsonp(result);
    });

    return router;
};