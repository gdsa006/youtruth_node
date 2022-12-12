require('dotenv').config()
let fork = require('child_process').fork;

const { Video, User, Channel, VideoCategory, 
    Subscription, fn, Like, WatchLater, QueryTypes, 
    VideoAudit, VideoFormat, View, sequelize } = require("../database/model");
let ffmpeg = require('fluent-ffmpeg');
let path = require('path');
let md5 = require('md5');
const fs = require("fs");
const uploadService = require("./upload.service");
const cache = require("./cache.service");
const uploadEnum = require("../enum/upload.enum");
const videoDao = require("../dao/video.dao");
const uploadDirectory = require('../config/uploadDirectory.config');
const videoStatusEnum = require('../enum/videoStatus.enum');
const videoFormatEnum = require('../enum/videoFormat.enum');
const mailService = require('./mail.service');


ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
ffmpeg.setFfprobePath(process.env.FPROBE_PATH);
ffmpeg.setFlvtoolPath(process.env.FLVTOOL_PATH);


let logger = require('../config/logger').getLogger('Video Service');

let pagination = async({ page, size }) => {
        let limit = size || 5;
        let offset = (page >= 1) ? (page-1) * size : 0;
        return { limit, offset };
}

let getVideosByCategoryIdOrLabel = async ({page, size, categoryId, label, email }) => {
    let validation = [], status='error', message=undefined, data = {};
    let videos = [], count = 0;
    try{
        let limit = size || 5;
        let offset = (page >= 1) ? (page-1) * size : 0;
        if(categoryId){
            videos = await videoDao.getVideosByCategoryId({categoryId: categoryId, limit: parseInt(limit), offset: parseInt(offset), count: false});
            count = await videoDao.getVideosByCategoryId({categoryId: categoryId, limit: parseInt(1), offset: parseInt(0), count: true}); 
        }else {
            logger.info(label);
            switch(label){
                case 'TRENDING_VIDEOS' : 
                    videos = await videoDao.getTrendingVideos({ limit: parseInt(limit), offset: parseInt(offset), count: false});
                    count = await videoDao.getTrendingVideos({ limit: parseInt(1), offset: parseInt(0), count: true});
                    break;
                case 'LATEST_VIDEOS':
                    videos = await videoDao.getLatestVideos({ limit: parseInt(limit), offset: parseInt(offset), count: false});
                    count = await videoDao.getLatestVideos({ limit: parseInt(1), offset: parseInt(0), count: true});
                    break;
                case 'TOP_VIDEOS' :
                    videos = await videoDao.getTopVideos({ limit: parseInt(limit), offset: parseInt(offset), count: false});
                    count = await videoDao.getTopVideos({ limit: parseInt(1), offset: parseInt(0), count: true});
                    break;
                case 'ARTICLE_VIDEOS' : 
                    videos = await videoDao.getArticleVideos({ limit: parseInt(limit), offset: parseInt(offset), count: false});
                    count = await videoDao.getArticleVideos({ limit: parseInt(1), offset: parseInt(0), count: true});
                    break;
                case 'SUBSCRIPTION_VIDEOS' :
                    if(email){
                        let user = await User.findOne({where:{email}, attributes : ['id']});
                        if(user){
                            videos = await videoDao.getSubscriptionVideos({userId: user.id, limit: parseInt(limit), offset: parseInt(offset), count: false});
                            count = await videoDao.getSubscriptionVideos({userId: user.id, limit: parseInt(1), offset: parseInt(0), count: true});
                        }
                    }
                    break;
                case 'YOUR_VIDEOS' : 
                    if(email){
                        let user = await User.findOne({where:{email}, attributes : ['id']});
                        if(user){
                            videos = await videoDao.getMyVideos({userId: user.id, limit: parseInt(limit), offset: parseInt(offset), count: false});
                            count = await videoDao.getMyVideos({userId: user.id, limit: parseInt(1), offset: parseInt(0), count: true});
                        }
                    }
                    break;
                case 'WATCH_LATER_VIDEOS' :
                    if(email){
                        let user = await User.findOne({where:{email}, attributes : ['id']});
                        if(user){
                            videos = await videoDao.getWatchLaterVideos({userId: user.id, limit: parseInt(limit), offset: parseInt(offset), count: false});
                            count = await videoDao.getWatchLaterVideos({userId: user.id, limit: parseInt(1), offset: parseInt(0), count: true});
                        }
                    }
                    break;
                default : 
            }
        }

        data['videos'] = videos;
        data['count'] = count;
        status = 'success';
        return {status,data, validation, message};
    }catch(err){
        logger.info(err);
        validation.push('Something went wrong');
        return {status,data, validation, message};
    }
}

let getVideosByChannelId = async({channelId, page, size }) => {
    logger.info(' Getting channel videos ');
    let validation = [], message = undefined, data = {}, status = 'error', user;
    try {
        let limit = size || 5;
        let offset = (page >= 1) ? (page-1) * size : 0;
        
            data.videos = await videoDao.getVideosByChannelId({ 
                channelId, 
                limit:parseInt(limit), 
                offset:parseInt(offset), 
                count: false
            });

            data.count = await videoDao.getVideosByChannelId({ 
                channelId, 
                limit:parseInt(limit), 
                offset:parseInt(offset), 
                count: true
            });

            data.page = Math.ceil(data['count']/size);

            if(data.videos && data.videos.length == 0)
                message = 'No video found';
            else 
                status = 'success';

        
        return { status, validation, message, data };
    } catch(err){
        logger.error('error '+ err)
        validation.push('Something went wrong!')
        return { status, validation, message };
    }
}

let getMyVideosByChannelId = async({channelId, page, size, email , userId}) => {
    logger.info(' Getting channel videos '+ email);
    let validation = [], message = undefined, data = {}, status = 'error', user = undefined;
    try {
        let limit = size || 5;
        let offset = (page >= 1) ? (page-1) * size : 0;
        if(email){
            user = await User.findOne({where:{email:email}, attributes: ['id','firstName','lastName','avatar']});
        }else if(userId){
            user = await User.findOne({where:{id:userId}, attributes: ['id','firstName','lastName','avatar']});
        }
        
        if(user){
            data.videos = await videoDao.getMyVideosByChannelId({ 
                channelId, 
                limit:parseInt(limit), 
                offset:parseInt(offset), 
                count: false, 
                userId:user.id
            });

            data.count = await videoDao.getMyVideosByChannelId({ 
                channelId, 
                limit:parseInt(limit), 
                offset:parseInt(offset), 
                count: true, 
                userId: user.id
            });

            data.page = Math.ceil(data['count']/size);
            data.user = user;
            status = 'success';
        } else 
            validation.push('User not found');
        
        return { status, validation, message, data };
    } catch(err){
        logger.error('error '+ err)
        validation.push('Something went wrong!')
        return { status, validation, message };
    }
}

let streamVideo = async (req, res) => {
    try { 
        let hash = req.query['hash'];
        let format = req.query['format'];
        let path = cache.get({hash});
        if(!path){
            let video = await Video.findOne({
                where: { hash, active: 1, visibility: 1 }, 
                attributes:['id', 'hash'],
                include: [
                    {
                        model: VideoFormat,
                        attributes: ['videoPath','resolution','meta'],
                        where : { status: 1, resolution: format },
                        limit: 1,
                        offset: 0
                    }
                ]
            });

            if(!video){
                return res.status(400).send("Invalid video id");
            }else {
                
                let videoPath = video.VideoFormats[0].videoPath;
                path = videoPath;
                cache.put({videoId: video.id, hash: video.hash, path : videoPath});
            }
        }
        const range = req.headers.range;
        if (!range) {
            return res.status(400).send("Requires Range header");
        }
        const videoSize = fs.statSync(path).size;
        const CHUNK_SIZE = 10 ** 6 * 2; // 1MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };
        res.writeHead(206, headers);
        const videoStream = fs.createReadStream(path, { start, end });
        videoStream.pipe(res);
    }catch(err){
        logger.error("err => " + err);
        res.send({status:'error', validation:['something went wrong']})
    }
}

let subscribe = async ({channelId, email, subscribe}) => {
    let status = 'error', validation = [], data = {}, message = undefined;
    try {
        let user = await User.findOne({where:{email, active:1}, attributes:['id']});
        if(user){
            let channel = await Channel.findOne({where : {id: channelId, active:1, visibility:1},attributes:['id']});
            if(channel){
                let subscription = await Subscription.findOne({where:{userId: user.id, channelId: channel.id, active:1}});
                if(subscribe){
                    if(!subscription){
                        await Subscription.create({userId:user.id, channelId: channelId});
                        message = 'You subscribed this video.';
                    } else 
                        validation.push("You already subscribed this channel");
                }else {
                    if(subscription){
                        await subscription.update({active:0});
                        message = 'You un-subscribed this channel';
                    } else
                        validation.push("You didn't subscribe this channel yet");
                }
                if(validation.length <= 0){
                    status = 'success';
                    data['subscribeCount'] = await Subscription.count({where : {channelId : channel.id, active: 1}});
                }
            }else
                validation.push("Channel not found");
        }else
            validation.push("User not found");
        return {status, validation, message, data};
    } catch(err){
        logger.error(err);
        validation.push('Something went wrong');
        return {status, validation}
    }
}

let doLike = async ({hash, email, doLike}) => {
    let status = 'error', validation = [], data = {}, message = undefined;
    try {
        let user = await User.findOne({where:{email, active:1}, attributes:['id']});
        if(user){
            let video = await Video.findOne({where : {hash, visibility:1, active: 1}, attributes:['id']});
            if(video){
                let like = await Like.findOne({where:{userId: user.id, videoId: video.id, active:1}});
                if(doLike){
                    if(!like){
                        await Like.create({userId:user.id, videoId: video.id});
                        message = 'You liked this video.'
                    } else 
                        validation.push("You already liked this video");
                }else {
                    if(like){
                        await like.update({active:0});
                        message = 'You un-liked this video.'
                    } else
                        validation.push("You didn't liked this video yet");
                }
                if(validation.length <= 0){
                    status = 'success';
                    data['likeCount'] = await Like.count({where : {videoId : video.id, active: 1}});
                }
            }else
                validation.push("Video not found");
        }else
            validation.push("User not found");
        return {status, validation, message, data};
    } catch(err){
        logger.error(err);
        validation.push('Something went wrong');
        return {status, validation}
    }
}

let watchLater = async ({hash, email, mark}) => {
    let status = 'error', validation = [], data = {}, message = undefined;
    try {
        let user = await User.findOne({where:{email, active:1}, attributes:['id']});
        if(user){
            let video = await Video.findOne({where : {hash, visibility:1, active: 1}, attributes:['id']});
            if(video){
                let watchLater = await WatchLater.findOne({where:{userId: user.id, videoId: video.id, active:1}});
                if(mark){
                    if(!watchLater){
                        await WatchLater.create({userId:user.id, videoId: video.id});
                        message = 'Marked as watch later.'
                    } else 
                        validation.push("You already marked as watch later.");
                } else {
                    if(watchLater){
                        await watchLater.update({active:0});
                        message = 'Un-marked from watch later.'
                    } else
                        validation.push("You didn't mark this video as watch later yet");
                }
                if(validation.length <= 0){
                    status = 'success';
                }
            }else
                validation.push("Video not found");
        }else
            validation.push("User not found");
        return {status, validation, message, data};
    } catch(err){
        logger.error(err);
        validation.push('Something went wrong');
        return {status, validation}
    }
}

let getVideoRecommendation = async ({hash, page, size}) => {
    let status = 'error', validation = [], message = undefined, data = {};
    try {
        let limit = size || 5;
        let offset = (page >= 1) ? (page-1) * size : 0;
        let videos = await videoDao.getRecommendation({hash, limit, offset, count:false});
        status = 'success';
        data['videos'] = videos;
        
        return {status, data, message, validation}
    } catch(err){
        validation.push('Something went wrong')
        return {status, validation}
    }
}

let actionOnVideoByAdmin = async ({ videoId, block }) => {
    let status = 'error', validation = [], message = undefined, data = {};
    try {
        let video = await Video.findOne({ 
            where:{ id: videoId, active:1},
            include: {
                model: Channel,
                attributes: ['name'],
                include: {
                    model: User,
                    attributes : ['email', 'firstName', 'lastName']
                }
            }, 
            attributes: ['id','name','createdAt','channelId']
        });

        if(video){
            if(block){
                await video.update({ status: videoStatusEnum.BLOCKED });
                cache.remove(videoId);
                mailService.sendVideoBlockMail({
                    email: video.Channel.User.email, 
                    channelName: video.Channel.name, 
                    videoName: video.name, 
                    uploadDate: video.createdAt,
                    username: video.Channel.User.firstName + ' ' + video.Channel.User.lastName
                });
                message="Video blocked successfully";
                status = 'success';
            } else { 
                await video.update({ status: videoStatusEnum.PENDING });
                mailService.sendVideoUnBlockMail({
                    email: video.Channel.User.email, 
                    channelName: video.Channel.name, 
                    videoName: video.name, 
                    uploadDate: video.createdAt,
                    username: video.Channel.User.firstName + ' ' + video.Channel.User.lastName
                });
                message="Video status marked as pending successfully";
                status = 'success';
            }
        } else
            message = "Video not found";
        
        return {status, data, message, validation}
    } catch(err){
        validation.push('Something went wrong')
        return {status, validation}
    }
}

let saveVideoEntry = async (body, email) => {
    logger.info(`Creating new video entry : ${email}`);
    let data = {}, status= 'error', validation = [], message = undefined, videoCover= undefined;
    try {
        let {size, name, type,categoryId,channelId,videoDescription,videoTitle,visibility, videoThumbnail } = body;
        let meta = JSON.stringify({type,size});
        let user = await User.findOne({where:{email:email, active:1}, attributes:['id']})
        let hash = md5(name.concat(size).concat(type).concat(new Date().getTime()));
        let videoInfo = JSON.stringify({ })

        let audit = {hash, name: videoTitle, description: videoDescription, channelId : channelId, userId : user.id, categoryId: categoryId, visibility : visibility };
        
        if(videoThumbnail && videoThumbnail.chunk){
            let result = await uploadService.uploadBase64Img({
                chunk: videoThumbnail.chunk, 
                email, 
                mime: videoThumbnail.type.split('/')[1], 
                uploadType : uploadEnum.CHANNEL_POSTER
            });
            if(result.status == 'success'){
                videoCover = JSON.stringify({baseDir: result.baseDir, screenshots : result.screenshots.split(',')});
                audit['poster']= videoCover;
            }
        }
        let video = await VideoAudit.create(audit);
        data['hash'] = hash;
        status = 'success';
        return {status, message, data}
    } catch(err){
        logger.error(err)
        validation.push('something went wrong')
        return {status, validation}
    }
}

let uploadVideo = async (body, {email}) => {
    logger.info(`Uploading video file : ${email}`);
    let data = {}, status= 'error', validation = [], message = undefined;
    try {
        let {size, name, type, hash, chunk, chunkIndex, totalChunk, mime } = body;
        if(chunkIndex <= totalChunk){
            let result = await uploadService.uploadBase64Video({chunk, hash, mime, uploadType: uploadEnum.VIDEO});
            status = 'success';
            data['progress'] = (chunkIndex / totalChunk)*100; 
            if(chunkIndex == totalChunk){
                const transaction = await sequelize.transaction();
                try{
                    logger.info('upload complete')
                    let va = await VideoAudit.findOne({where:{hash:hash, status:0}, attributes : ['id', 'name', 'description', 'channelId', 'userId', 'categoryId', 'visibility','status','poster'], transaction: transaction}); // unprocessed video
                    if(va){
                        
                        let video = await Video.create({hash: hash, name: va.name, description: va.description, 
                            channelId: va.channelId, userId: va.userId, categoryId: va.categoryId, visibility: va.visibility, poster: va.poster}, {transaction: transaction});
                        
                        await VideoFormat.create({ videoId:video.id, videoPath:result.file, meta:'{}', status:1},{transaction: transaction});
                        await va.update({ status: 1},{transaction: transaction});
                        await transaction.commit();

                        if(!va.poster){
                            logger.info('Taking video screenshot.')
                            takeVideoScreenShot({hash, file: result.file});
                        } else 
                            logger.info('Skiping video screenshot.')

                        logger.info('Extracting video meta info.');
                        extractVideoMetaData({videoId:video.id, resolution: videoFormatEnum.DEFAULT , file: result.file});

                        message = "Video uploaded successfully";
                        data.uploadFlag = 1; 
                        
                        // logger.info('Calling 720p converter')
                        // const forked = fork(path.join(__dirname,'..','process','720pVideoConverter.js'));
                        // forked.send({ hash: hash, defaultFormatPath: result.file, videoId: video.id });
                    }
                } catch(errorMsg){            
                    if(transaction)
                        await transaction.rollback();
                    throw new Error(errorMsg)
                }
            }else {
                data.uploadFlag = 0; 
            }
            return {status, message, data}
        } else {
            validation.push('Invalid chunk');
            return {status, message, data}
        }
    }catch(err){
        logger.error(err)
        validation.push('something went wrong')
        return {status, validation}
    }
}

let getVideoByHash = async ({hash, auth }) => {
    let status = 'error', validation = [], data = {};
    try {
        data['isLoggedIn'] = false;
        let video = await videoDao.getVideoByHash(hash);
        if(video){
            let isLiked = undefined, isSubscribed = undefined, isMarkedwatchLater = undefined, likeCount = 0, subscribeCount = 0;
            if(auth && auth.email){
                let user = await User.findOne({where : { email: auth.email, active : 1}});
                if(user){
                    data['isLoggedIn'] = true;
                    isLiked = await Like.findOne({where : {userId : user.id, videoId : video.id, active: 1}});
                    isSubscribed = await Subscription.findOne({where : {userId : user.id, channelId : video.Channel.id, active: 1}}); 
                    isMarkedwatchLater = await WatchLater.findOne({where:{userId: user.id, videoId: video.id, active:1}});
                }
            }

            likeCount = await Like.count({where : {videoId : video.id, active: 1}});
            viewCount = await View.count({where : {videoId : video.id, active: 1}});
            subscribeCount = await Subscription.count({where : {channelId : video.Channel.id, active: 1}});

            data['video'] = video;
            data['isLiked'] = isLiked ? true : false;
            data['isSubscribed'] = isSubscribed ? true : false;
            data['isMarkedwatchLater'] = isMarkedwatchLater ? true : false;
            data['likeCount'] = likeCount;
            data['viewCount'] = viewCount;
            data['subscribeCount'] = subscribeCount;
            status='success';
        }else 
            validation.push('Video not found'); 
        return {status, validation, data}
    } catch (err) {
        logger.error("error " + err);
        validation.push('Something went wrong');
        return {status, validation, data}
    }
}

let getVideoCategoryList = async () => {
    logger.info('Getting categories list');
    let validation = [], message = undefined, data = {}, status = 'error';
    try {
        let categories = await VideoCategory.findAll({
            where : {active:1},
            attributes : ['name','id','fontAwesomeClass']
        });

        if(categories && categories.length >= 0){
            data['categories'] = categories;
            status='success';
            // message='Categories list are loaded';
        } else 
            validation.push('Categories not found');
        return {status,validation,message, data};
    } catch(err){
        logger.error(err)
        return {status,validation,message};
    }
}

let extractVideoMetaData = async ({ videoId, resolution, file }) => {
    ffmpeg.ffprobe( file, async(err, data) => {
        if(err) throw new Error(err);
        
        let meta = {streams:[], format:{}}
        
        let {streams, format} = data;
        
        meta.format['duration'] = format['duration'];
        meta.format['size'] = format['size'];
        meta.format['bit_rate'] = format['bit_rate'];
    
        if(streams && streams.length > 0){
            for(let stream of streams){
                let _stream = {};
                _stream['display_aspect_ratio']=stream['display_aspect_ratio'];
                _stream['width']=stream['width'];
                _stream['height']=stream['height'];
                _stream['codec_name']=stream['codec_name'];
                _stream['profile']=stream['profile'];
                _stream['codec_type']=stream['codec_type'];
                _stream['bit_rate']=stream['bit_rate'];
                meta.streams.push(_stream);
            }
        }

        let meta_string = JSON.stringify(meta);
        await VideoFormat.update({ meta: meta_string },{ where: {videoId: videoId, resolution: resolution }});
        await Video.update({ duration: format['duration'] }, { where: { id: videoId }})
    })
}

let takeVideoScreenShot = async ({hash, file}) => {
    let screenshots = undefined;
    let timemarks = [25,50,75];
    
    let { actual, relative } = await uploadDirectory.videoPoster(hash);
        ffmpeg(file)
            .on('filenames', (files) => {
                logger.info(`video screenshots => ${files}`);
                screenshots = files;
            })
            .on('end', async () => {
                logger.info('screenshots saved');
                let poster = JSON.stringify({ baseDir: relative, screenshots: screenshots });
                await Video.update({poster},{where:{hash:hash}});
            })
            .on('error', (err) => {
                logger.error("Error :" + err)
                logger.error('Error while taking screenshots of video : '+ hash);
            })
            .takeScreenshots({
                folder: actual,
                filename:`poster.png`,
                timemarks:timemarks
            });
}

let searchVideo = async({words, all, page, size}) => {
    logger.info('Getting categories list');
    let validation = [], message = undefined, data = {}, status = 'error';
    try {

        let limit = size || 5;
        let offset = (page >= 1) ? (page-1) * size : 0;
        data['records'] = await videoDao.getSearchResult({ 
            words, 
            limit:parseInt(limit), 
            offset:parseInt(offset), 
            count: false, 
            all
        });

        data['count'] = await videoDao.getSearchResult({ 
            words, 
            limit:parseInt(1), 
            offset:parseInt(0), 
            count: true
        });

        
        status='success';
        return {status,validation,message, data};
    } catch(err){
        logger.error(err)
        validation.push('Something went wrong')
        return {status,validation,message};
    }
}

let deleteVideo = async({hash, email})=>{
    logger.info('Getting categories list');
    let validation = [], message = undefined, data = {}, status = 'error';
    try{
        let user = await User.findOne({where : {email:email}, attributes: ['id']});
        if(user){
            let video = await Video.findOne({where:{hash: hash, userId: user.id, active: 1}, attributes: ['id']});
            if(video){
                await video.update({ active:0 });
                message = 'Video details updated successfully';
                status = 'success';
            }else
             validation.push("Video not found");
        }else
            validation.push('Invalid User');
            return { status, data, validation, message }
    } catch(err){
        logger.error(err)
        validation.push('Something went wrong')
        return {status,validation,message};
    }
}

let updateVideo = async({body, email})=>{
    logger.info('Updating video details : => '+ body.videoId);
    let validation = [], message = undefined, data = {}, status = 'error';
    try{
        let { hash, categoryId, videoTitle, visibility, videoDescription, channelId } = body;
        let user = await User.findOne({where : {email:email}, attributes: ['id']});
        if(user){
            let video = await Video.findOne({where:{ hash: hash, userId: user.id }, attributes: ['id','description','name','visibility','categoryId','channelId','active']});
         
            if(video){
                let details = {};
                if(videoDescription)
                    details['description'] = videoDescription;
                if(videoTitle)
                    details['name'] = videoTitle;
                if(visibility)
                    details['visibility'] = parseInt(visibility);
                if(categoryId)
                    details['categoryId'] = parseInt(categoryId);
                if(channelId)
                    details['channelId'] = parseInt(channelId);

                if(video.active){
                    if(Object.keys(details).length > 0){
                        let result = await video.update(details);
                            
                        message = 'Video details updated successfully';
                        status = 'success';
                    }
                } else {
                    validation.push('Blocked/Inactive video details cannot be updated.')
                }
            }else
              validation.push("Video not found");
        }else
            validation.push('Invalid User');
            return { status, data, validation, message }
    } catch(err){
        logger.error(err)
        validation.push('Something went wrong')
        return {status,validation,message};
    }
}

let getBasicVideoDetailsByHash = async({hash}) => {
    let data={}, status = 'error', validation = [];
    try {
        data.video = await videoDao.getVideoByHash(hash);
        status = 'success';
        return { status, data} 
    } catch(err) {
        validation.push('Something went wrong!');
        return { status, data, validation}
    }
}

let markView = async({ videoId, req, auth }) => {
    let data={}, status = 'error', validation = [];
    try {
        let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        let userAgent = req.headers['user-agent'];
        let user = undefined;
        if(auth && auth.email){
            user = await User.findOne({where:{email: auth.email}, attributes:['id']});
        }
        let newView = {};
        if(user)
            newView.userId = user.id;
        if(videoId)
            newView.videoId = videoId;
        if(ipAddress)
            newView.ipAddress = ipAddress;
        if(userAgent)
            newView.meta = userAgent;

        if(Object.keys(newView).length > 0)
            await View.create(newView);
        data.view = await sequelize.query('select count(id) as count from views where videoId = :videoId and active=1',
        { type: QueryTypes.SELECT, replacements: {videoId: videoId} });
        status = 'success';
        return { status, data} 
    } catch(err) {
        logger.error(err)
        validation.push('Something went wrong!');
        return { status, data, validation}
    }

}

// 
let getAllVideosByStatus = async({ videoStatus, page, size }) => {
    let data={}, status = 'error', validation = [];
    try {
        let { limit, offset } = await pagination({ page, size });
        if(Object.keys(videoStatusEnum).includes(videoStatus)){
            data.videos = await Video.findAll({
                where: { active: 1, status: videoStatus }, 
                attributes:['id','hash','name','status','visibility','active','createdAt','poster','description'],
                include : [{
                    model: Channel,
                    attributes : ['id', 'name', 'active','visibility', 'status'],
                    where : { active: 1}
                },
                {
                    model: User,
                    attributes: ['firstName', 'lastName','id']
                }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            data.count = await Video.count({
                where: { active: 1, status: videoStatus },
                include : {
                    model: Channel,
                    where : { active: 1}
                }
            });

             status = 'success'
        } else 
            validation.push('Invalid video status');
        return { status, data, validation} 
    } catch(err) {
        logger.error(err)
        validation.push('Something went wrong!');
        return { status, data, validation}
    }
}

let rejectOrPublishRequestByVideoId = async ({videoId, videoStatus}) => {
    let data={}, status = 'error', validation = [], message = undefined;
    try {
        if(videoStatus == videoStatusEnum.PUBLISHED ){
            let video = await Video.findOne({ 
                where:{ id: videoId, status: videoStatusEnum.PENDING, active:1},
                include: {
                    model: Channel,
                    attributes: ['name'],
                    include: {
                        model: User,
                        attributes : ['email', 'firstName', 'lastName']
                    }
                }, attributes: ['id','name','createdAt','channelId']});
            if(video){
                await video.update({status: videoStatusEnum.PUBLISHED});
                mailService.sendVideoPublishedMail({
                    email: video.Channel.User.email, 
                    channelName: video.Channel.name, 
                    videoName: video.name, 
                    uploadDate: video.createdAt,
                    username: video.Channel.User.firstName + ' ' + video.Channel.User.lastName
                });
                status = 'success';
                message = 'Video has been published ';
            } else 
                validation.push('Invalid publish video request');
        } else if( videoStatus == videoStatusEnum.REJECTED ){
            let video = await Video.findOne({
                where:{id: videoId, status: videoStatusEnum.PENDING, active:1},
                include: {
                    model: Channel,
                    attributes: ['name'],
                    include: {
                        model: User,
                        attributes : ['email', 'firstName', 'lastName']
                    }
                }, 
                attributes: ['id','name','createdAt','channelId']});;
            if(video){
                await video.update({status: videoStatusEnum.REJECTED});
                mailService.sendVideoRejectedMail({
                    email: video.Channel.User.email, 
                    channelName: video.Channel.name, 
                    videoName: video.name, 
                    uploadDate: video.createdAt,
                    username: video.Channel.User.firstName + ' ' + video.Channel.User.lastName
                });
                status = 'success';
                message = 'Video publish request has been rejected ';
            }else 
                validation.push('Invalid reject video request');
        } else 
            validation.push('Invalid publish/reject video request');
        
        return { status, data, validation, message} 
    } catch(err) {
        logger.error(err)
        validation.push('Something went wrong!');
        return { status, data, validation}
    }
}

// ---------------------------------------------------------------------

module.exports = {
    getVideosByCategoryIdOrLabel: getVideosByCategoryIdOrLabel,
    getVideoCategoryList : getVideoCategoryList,
    getVideosByChannelId : getVideosByChannelId,
    getMyVideosByChannelId : getMyVideosByChannelId,

    saveVideoEntry :  saveVideoEntry,
    uploadVideo : uploadVideo,
    takeVideoScreenShot: takeVideoScreenShot,
    extractVideoMetaData: extractVideoMetaData,
    getVideoByHash : getVideoByHash,
    streamVideo : streamVideo,
    subscribe : subscribe,
    doLike : doLike,
    watchLater : watchLater,
    getVideoRecommendation : getVideoRecommendation,
    actionOnVideoByAdmin : actionOnVideoByAdmin,
    searchVideo:searchVideo,
    updateVideo: updateVideo,
    getBasicVideoDetailsByHash: getBasicVideoDetailsByHash,
    deleteVideo: deleteVideo,
    markView: markView,
    getAllVideosByStatus : getAllVideosByStatus,
    rejectOrPublishRequestByVideoId: rejectOrPublishRequestByVideoId
}