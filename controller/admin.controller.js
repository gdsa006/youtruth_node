const videoStatusEnum = require('../enum/videoStatus.enum');
const channelService = require('../service/channel.service');
const userService = require('../service/user.service');
const videoService = require('../service/video.service');
const router = require('express').Router();

module.exports = (csrf) => {


    // api
    router.get('/get/users', userService.getUsers);

    
    router.get('/get/user/:userId/channel/:channelId/videos', async(req, res) => {
        let { email } = res.locals.auth;
        let result = await videoService.getMyVideosByChannelId({
            page: req.query.page,
            size: req.query.size,
            channelId: req.params.channelId,
            userId : req.params.userId
        });
        res.jsonp(result)
    });

    router.get('/get/user/:userId/channels', channelService.getAllChannels);

    router.post('/video/:id/block', async (req, res) => {
        let result = await videoService.actionOnVideoByAdmin({videoId: req.params.id, block: true });
        return res.jsonp(result)
    });

    router.post('/video/:id/unblock', async (req, res) => {
        let result = await videoService.actionOnVideoByAdmin({videoId: req.params.id, block: false });
        return res.jsonp(result)
    })

    router.post('/channel/:id/block', async (req, res) => {
        let result = await channelService.actionOnChannelByAdmin({channelId: req.params.id, block: true });
        return res.jsonp(result)
    });

    router.post('/channel/:id/unblock', async (req, res) => {
        let result = await channelService.actionOnChannelByAdmin({channelId: req.params.id, block: false });
        return res.jsonp(result)
    })

    router.post('/user/:id/block', async (req, res) => {
        let result = await userService.actionOnUserByAdmin({userId: req.params.id, block: true });
        return res.jsonp(result)
    });

    router.post('/user/:id/unblock', async (req, res) => {
        let result = await userService.actionOnUserByAdmin({userId: req.params.id, block: false });
        return res.jsonp(result)
    })

    router.get('/get/video/request', async(req, res) => {
        let { status, page, size } = req.query;
        let result = await videoService.getAllVideosByStatus({
            page,
            size,
            videoStatus :  status
        });
        return res.jsonp(result)
    })

    router.get('/get/statistic', async(req, res) => {
        let result = await userService.getStatistic();
        return res.jsonp(result);
    })

    
    router.post('/post/publish-reject/video', async(req, res) => {
        let { videoId, videoStatus } = req.body;
        let result = await videoService.rejectOrPublishRequestByVideoId({ videoId, videoStatus });
        return res.jsonp(result);
    })

    return router;
};