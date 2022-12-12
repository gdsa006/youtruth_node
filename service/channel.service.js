const { Video, User, Channel, fn, sequelize, Op } = require("../database/model");
const uploadEnum = require("../enum/upload.enum");
const { uploadBase64Img } = require("./upload.service");
const logger = require('../config/logger').getLogger('Channel Service');
const md5 = require('md5');
const { QueryTypes } = require("sequelize");
const channelStatusEnum = require('../enum/channelStatus.enum');
const mailService = require('./mail.service');


let getChannelsByUserId = async({userId, page, size }) => {
    logger.info('Inside post create channel service');
        let validation = [], message = undefined, data = {}, status = 'error';
        try{
            let limit = size || 5;
            let offset = (page >= 1) ? (page-1) * size : 0;
       
            let user = await User.findOne({where:{id:userId}, attributes:['id']});
     
            if(user){
                let count = await Channel.count({where : {userId:user.id, active: 1, visibility: 1, status: channelStatusEnum.PUBLISHED}});
                let sql = `select c.name,c.description,c.channelArt,c.visibility,c.createdAt,c.id, c.active, c.status, 
                (select count(v.id) from video v where v.active=1 and v.visibility=1 and v.status = 'PUBLISHED' and v.channelId = c.id) as videoCount, u.firstName, u.lastName, u.id as userId from channel c  inner join 
                user u on u.id=c.userId where c.userId=? and c.active = 1 and c.visibility = 1 and c.status = 'PUBLISHED' 
                limit ? offset ? `;

                let channels = await sequelize.query(sql, {
                                    replacements : [userId, parseInt(limit), parseInt(offset)],
                                    type: QueryTypes.SELECT
                                })
                
                data['channels'] = channels;
                data['pages'] = Math.ceil(count/size);
                data['count'] = count;
                status='success';
                if(data.channels && data.channels.length == 0)
                    message = 'No channels found!';
            } else 
                validation.push('User not found')
            return { status, validation, message, data};
        } catch(err){
            logger.error("error : "+err)
            return { status, validation, message };
        }
}

module.exports = {
    getChannelsByUserId: getChannelsByUserId, 
    getAllChannels : async (req, res) => {
        let validation = [], status='error', message=undefined, data = {};
        let { page, size } = req.query;
        let { userId } = req.params;
        try{
            let limit = size || 5;
            let offset = (page >= 1) ? (page-1) * size : 0;
            let count = await Channel.count({where : { userId : userId, status:{ [Op.not]: [channelStatusEnum.DELETED]} }});
            let channels = await Channel.findAll({
                where : { userId : userId, status:{ [Op.not]: [channelStatusEnum.DELETED]} },
                limit:parseInt(limit),
                offset:parseInt(offset),
                attributes:['id','name','description','channelArt','visibility','active','createdAt','status'],
                include : [{
                    model : User,
                    attributes : ['firstName','lastName','id']
                }],
                order:[['createdAt','DESC']]
            });
            if(!channels || channels.length <= 0 ) {message = 'No data found'} else {message = 'channels data loaded.'};
            return res.jsonp({status:'success',data : {count, channels}, validation, message});
        }catch(err){
            logger.error(err)
            validation.push('Something went wrong');
            return res.jsonp({status,data, validation, message});
        }
        
    },
    postCreateChannel : async (req, res) => {
        logger.info('Inside post create channel service');
        let validation = [], message = undefined, data = {}, status = 'error';
        try{
                let { email } = res.locals.auth;
                let { name, description, visibility, channelArt, mime, size, type } = req.body;
                let user = await User.findOne({where:{email,active:1}})
                if(user){
                    logger.info(`Uploading channel art...`)
                let upload = await uploadBase64Img({chunk : channelArt, mime, email, uploadType: uploadEnum.CHANNEL_POSTER});
                if(upload && upload.status == 'success'){
                    let channel = await Channel.create({ name, description, visibility, userId:user.id, channelArt : upload.file });
                
                    status='success';
                    message='Channel created successfully';
                    data.channel = channel;
                }else 
                    validation.push('Channel poster upload error')   
            }else {
                validation.push('User not found')
            }
            return res.jsonp({status,data,validation,message});
        } catch(err){
            logger.error(err)
            return res.jsonp({status,validation,message});
        }
    },
    getUsersChannel : async ({page, size, email, userId}) => {
        logger.info('Inside post create channel service');
        let validation = [], message = undefined, data = {}, status = 'error';
        try{
            let limit = size || 5;
            let offset = (page >= 1) ? (page-1) * size : 0;
            if(email){
                let user = await User.findOne({where:{email:email}, attributes:['id']});
                userId = user.id;
            }
                
            if(userId){
                let count = await Channel.count({where : {userId:userId, active:1, visibility: 1}});
                let sql = `select c.name,c.description,c.channelArt,c.visibility,c.createdAt,c.id, c.active, c.status, 
                (select count(v.id) from video v where v.active=1 and v.visibility=1 and v.channelId = c.id ) as videoCount, u.firstName, 
                u.lastName, u.id as userId from channel c left join user u on u.id=c.userId where c.userId=? and c.active = 1 and c.visibility=1 
                limit ? offset ? `;
               
                let channels = await sequelize.query(sql, {
                                    replacements : [userId, parseInt(limit), parseInt(offset)],
                                    type: QueryTypes.SELECT
                                })
                
                data['channels'] = channels;
                data['pages'] = Math.ceil(count/size);
                data['count'] = count;
                status='success';
                if(data.channels && data.channels.length == 0)
                    message = 'No channels found!';
            } else 
                validation.push('User not found')
            return { status, validation, message, data};
        } catch(err){
            logger.error("error : "+err)
            return { status, validation, message };
        }
    },
    getMyChannel : async ({ page, size, email, userId }) => {
        logger.info('Inside post create channel service');
        let validation = [], message = undefined, data = {}, status = 'error';
        try{
            let limit = size || 5;
            let offset = (page >= 1) ? (page-1) * size : 0;
            if(email){
                let user = await User.findOne({where:{email:email}, attributes:['id']});
                userId = user.id;
            }
                
            if(userId){
                let count = await Channel.count({where : {userId:userId, active: 1}});
                let sql = `select c.name,c.description,c.channelArt,c.visibility,c.createdAt,c.id, c.active, c.status, 
                (select count(v.id) from video v where v.active=1 and v.channelId = c.id ) as videoCount, u.firstName, 
                u.lastName, u.id as userId from channel c left join user u on u.id=c.userId where c.userId=? and c.active=1 
                limit ? offset ? `;
               
                let channels = await sequelize.query(sql, {
                                    replacements : [userId, parseInt(limit), parseInt(offset)],
                                    type: QueryTypes.SELECT
                                })
                
                data['channels'] = channels;
                data['pages'] = Math.ceil(count/size);
                data['count'] = count;
                status='success';
                if(data.channels && data.channels.length == 0)
                    message = 'No channels found!';
            } else 
                validation.push('User not found')
            return { status, validation, message, data};
        } catch(err){
            logger.error("error : "+err)
            return { status, validation, message };
        }
    },
    getMyChannelById : async({channelId, email}) => {
        logger.info('Getting channel details by id');
        let validation = [], message = undefined, data = {}, status = 'error';
        try {
            let channel = await sequelize.query(`select c.name,c.description,c.channelArt,c.visibility,c.createdAt,c.id, c.active, c.status,
                (select count(v.id) from video v where v.active=1 and v.channelId=c.id) as videoCount, u.firstName, u.lastName, u.id as userId from channel c  inner join user u on u.id=c.userId
                where c.id=? and c.active=1 limit 1 offset 0`, {
                                    replacements : [parseInt(channelId)],
                                    type: QueryTypes.SELECT
                                })
                
            if(channel && channel.length > 0){
                status="success";
                data.channel = channel[0];
            }
            return {status,validation,message, data};
        } catch(err){
            logger.error(err)
            return {status,validation,message};
        }
    },
    getUsersChannelName : async (req, res) => {
        logger.info('Getting channels name list');
        let validation = [], message = undefined, data = {}, status = 'error';
        try {
            let { email } = res.locals.auth;
            let user = await User.findOne({where:{email,active:1}, attributes:['id']});
            let channels = await Channel.findAll({
                where : {userId:user.id, active:1},
                attributes : ['name','id']
            });

            if(channels && channels.length >= 0){
                data['channels'] = channels;
                status='success';
                // message='You channels list are loaded';
            } else 
                validation.push('Channels not found');
            return res.jsonp({status,validation,message, data});
        } catch(err){
            logger.error(err)
            return res.jsonp({status,validation,message});
        }
    },
    getChannelById : async({channelId}) => {
        logger.info('Getting channel details by id');
        let validation = [], message = undefined, data = {}, status = 'error';
        try {
            let channel = await sequelize.query(`select c.name,c.description,c.channelArt,c.visibility,c.createdAt,c.id, c.active, c.status,
                (select count(v.id) from video v where v.active=1 and v.visibility=1 and v.status='PUBLISHED' and v.channelId=c.id) as videoCount,
                 u.firstName, u.lastName, u.id as userId from channel c  inner join user u on u.id=c.userId
                where c.id=? and c.active=1 and c.visibility=1 and c.status='PUBLISHED' limit 1 offset 0`, {
                                    replacements : [parseInt(channelId)],
                                    type: QueryTypes.SELECT
                                })
                
            if(channel && channel.length > 0){
                status="success";
                data.channel = channel[0];
            }
            return {status,validation,message, data};
        } catch(err){
            logger.error(err)
            return {status,validation,message};
        }
    },
    actionOnChannelByAdmin : async ({ channelId, block }) => {
        let status = 'error', validation = [], message = undefined, data = {};
        try {
            let channel = await Channel.findOne({ 
                where : {id: channelId, active: 1 },
                include: {
                    model: User,
                    attributes: ['email', 'firstName', 'lastName']
                },
                attributes:['name','createdAt','id']
            });

            if(channel){
                if(block){
                    await channel.update({status: channelStatusEnum.BLOCKED });
                    mailService.sendChannelBlockedMail({
                        channelName: channel.name,
                        email: channel.User.email,
                        username: channel.User.firstName + ' ' + channel.User.lastName,
                        createDate: channel.createdAt
                    })
                    status = 'success';
                    message = 'Channel blocked successfully';
                } else {
                    await channel.update({status: channelStatusEnum.PUBLISHED });
                    mailService.sendChannelUnBlockedMail({
                        channelName: channel.name,
                        email: channel.User.email,
                        username: channel.User.firstName + ' ' + channel.User.lastName,
                        createDate: channel.createdAt
                    })
                    status = 'success';
                    message = 'Channel published successfully';
                }
            } else 
                validation.push('Channel not found');

            return {status, data, message, validation}
        } catch(err){
            validation.push('Something went wrong')
            return {status, validation}
        }
    },
    updateChannel : async ({body, email}) => {
        let status = 'error', validation = [], message = undefined, data = {};
        try {
            let { channelId, description, name, visibility } = body;
            let user = await User.findOne({where: {email}, attributes:['id']});
            if(user){
                let channel = await Channel.findOne({where:{id: parseInt(channelId), userId: user.id}, attributes: ['id','active']});
                if(channel){
                    if(channel.active == 1){
                        let details = {};
                        if(name)
                            details.name = name;
                        if(description)
                            details.description = description;
                        if(visibility)
                            details.visibility = parseInt(visibility);
                        if(Object.keys(details).length > 0){
                            await channel.update(details);
                            status="success";
                            message="Channel updated successfully";
                        }
                    }else 
                        validation.push('Blocked/Deleted channel cannot be updated');
                }else 
                    validation.push("Channel not found");
            }else 
                validation.push('User not found');
            return {status, data, message, validation}
        } catch(err){
            validation.push('Something went wrong')
            return {status, validation}
        }
    },
    deleteChannel :  async({channelId, email}) => {
        let status = 'error', validation = [], message = undefined, data = {};
        try {
            let user = await User.findOne({where: {email}, attributes:['id']});
            if(user){
                let channel = await Channel.findOne({where:{id: parseInt(channelId), userId: user.id, active: 1}, attributes: ['id','active']});
                if(channel){
                    await channel.update({active:0, status: channelStatusEnum.DELETED});
                    status = "success";
                    message = "Channel deleted successfully";
                }else 
                    validation.push("Channel not found");
            }else 
                validation.push('User not found');
            return {status, data, message, validation}
        } catch(err){
            validation.push('Something went wrong')
            return {status, validation}
        }
    }
}