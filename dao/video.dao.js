const { Video, User, Subscription, Like, Channel, fn, VideoCategory, sequelize, QueryTypes } = require("../database/model");
const moment = require('moment');


// Temporary video details
let temp = `select v.id, v.name ,v.hash,v.description, v.active, v.visibility, cat.name as category, v.channelId,
                concat(u.firstName,' ',u.lastName) as creator,v.createdAt, v.userId, v.id as videoId, v.poster, 
                (select count(l.id) from likes l where l.videoId=v.id and l.active=1) as likes, 
                (select count(vw.id) from views vw where vw.active=1 and vw.videoId=v.id) as views, 
                v.status, c.name as channelName, c.status as channelStatus, c.active as channelActive,
                 c.visibility as channelVisibility, c.channelArt 
                from video v 
                left join channel c on c.id=v.channelId 
                left join user u on u.id=v.userId 
                left join video_category cat on cat.id=v.categoryId `;



let getVideoByHash = async (hash) => {
    let video = await Video.findOne({
        where:{hash:hash}, 
        attributes:['hash','name','description','visibility','createdAt','categoryId','id'],
        include:[{
                model:Channel,
                attributes:['name','description','id','channelArt'],
                include:[
                    {
                        model:User,
                        attributes:['firstName','lastName','id']
                    }
                ]
            },
            {
                model:VideoCategory,
                attributes:['name']
            }
        ]
    });

    return video;
}


let getRecommendation = async({count, hash, limit, offset}) => {

    let replacements = {};

    let sv = await Video.findOne({where:{hash}, attributes: [ 'hash', 'channelId', 'categoryId', 'userId', 'id']});

    let fields = ` v.id, v.name, v.hash, v.description, v.channelId, v.poster, c.channelArt, v.active, v.userId, v.visibility, v.createdAt,
     c.name as channelName, concat(u.firstName,' ', u.lastName) as creator, (select count(vw.id) from views vw where vw.active=1 and vw.videoId = v.id ) as views `;
    
    if(count)
        fields = 'count(v.id) as count';
    
    let sql = `select ${fields}
    from video v 
    left join channel c on c.id = v.channelId 
    left join user u on u.id = c.userId  where ( v.channelId = :channelId or c.userId = :userId  or v.categoryId = :categoryId )
    and v.hash != :hash and v.active=1 and v.visibility =1 and v.status ='PUBLISHED' and c.active=1 and c.visibility =1 `;

    replacements['channelId'] = parseInt(sv.channelId);
    replacements['userId'] = parseInt(sv.userId);
    replacements['categoryId'] = parseInt(sv.categoryId);
    replacements['hash'] = sv.hash;
    
    if(!count){
        sql += ' limit :limit offset :offset ';
        replacements['limit'] = parseInt(limit);
        replacements['offset'] = parseInt(offset);
    }

    let records = await sequelize.query(sql, { type: QueryTypes.SELECT, replacements: replacements });
    if(count)
        return records[0].count;
    else {
        return records.map(record => { 
            return {...record, createdAt: moment(record.createdAt, "YYYYMMDD").fromNow()}
        });
    }
}


let getVideosByChannelId = async ({ 
    channelId, 
    limit, 
    offset, 
    count
 }) => {
        
    let replacements = {};

    let fields = ` v.active, v.id, v.name, v.hash, v.description, v.channelId, v.poster, c.channelArt, v.visibility, v.status, 
            v.userId, v.createdAt, c.name as channelName, concat(u.firstName,' ', u.lastName) as creator,
            (select count(vw.id) from views vw where vw.active=1 and vw.videoId= v.id) as views `;
    
    if(count)
        fields = 'count(v.id) as count';
    
    let sql = `select ${fields} from video v left join channel c on c.id = v.channelId 
        left join user u on u.id = c.userId where v.channelId = :channelId and v.active = 1 and v.visibility = 1
         and v.status = 'PUBLISHED'`;

        replacements['channelId'] = channelId;

    if(!count){
        sql += ' limit :limit offset :offset ';
        replacements['limit'] = parseInt(limit);
        replacements['offset'] = parseInt(offset);
    }

    let records = await sequelize.query(sql, { type: QueryTypes.SELECT, replacements: replacements });

    if(count)
        return records[0].count;
    else {
        return records.map(record => { 
            return {...record, createdAt: moment(record.createdAt, "YYYYMMDD").fromNow()}
        });
    }
}




let getMyVideosByChannelId = async ({ 
    channelId, 
    limit, 
    offset, 
    count,
    userId }) => {
        
    let replacements = {};

    let fields = ` v.active, v.id, v.name, v.hash, v.description, v.channelId, v.poster, c.channelArt, v.visibility,v.status, 
            v.userId, v.createdAt, c.name as channelName, concat(u.firstName,' ', u.lastName) as creator,
            (select count(vw.id) from views vw where vw.active=1 and vw.videoId = v.id ) as views 
            `;
    
    if(count)
        fields = 'count(v.id) as count';
    
    let sql = `select ${fields} from video v left join channel c on c.id = v.channelId 
        inner join user u on u.id = c.userId where v.channelId = :channelId and c.userId = :userId and v.active=1`;

        replacements['channelId'] = parseInt(channelId);
        replacements['userId'] = parseInt(userId);

    if(!count){
        sql += ' limit :limit offset :offset ';
        replacements['limit'] = parseInt(limit);
        replacements['offset'] = parseInt(offset);
    }

    let records = await sequelize.query(sql, { type: QueryTypes.SELECT, replacements: replacements });

    if(count)
        return records[0].count;
    else {
        return records.map(record => { 
            return {...record, createdAt: moment(record.createdAt, "YYYYMMDD").fromNow()}
        });
    }
}


let getSubscriptionVideos = async ({userId, limit, offset, count}) => {
        
    let fields = ` v.id, v.name, v.hash, v.description, v.channelId, v.visibility, v.poster, c.channelArt, v.active, v.userId, 
    v.createdAt, c.name as channelName, concat(u.firstName,' ', u.lastName) as creator,
    (select count(vw.id) from views vw where vw.active=1 and vw.videoId = v.id ) as views `;
    
    if(count)
        fields = ' count(v.id) as count ';

    let records = await sequelize.query(`select ${fields}
                            from video v 
                            left join channel c on c.id = v.channelId 
                            left join user u on u.id = c.userId 
                            where v.channelId in (select s.channelId from subscription s where s.userId = :userId) 
                            and v.active =1 and v.visibility = 1 and v.status = 'PUBLISHED' 
                            and c.active=1 and c.visibility=1 and c.status='PUBLISHED' 
                            limit :limit offset :offset
                            `, {
                                type: QueryTypes.SELECT,
                                replacements: { userId: userId, limit : parseInt(limit), offset : parseInt(offset) }
                            });
    if(count)
        return records[0].count;
    else {
            return records.map(record => { 
                return {...record, createdAt: moment(record.createdAt, "YYYYMMDD").fromNow()}
            });
        }
}


let getWatchLaterVideos = async ({userId, limit, offset, count}) => {
        
    let fields = ` v.id, v.name, v.hash, v.description, v.channelId, v.poster, c.channelArt , v.active, v.userId, v.visibility, v.createdAt, 
    c.name as channelName, concat(u.firstName,' ', u.lastName) as creator,
     (select count(vw.id) from views vw where vw.active=1 and vw.videoId = v.id ) as views `;
    if(count)
        fields = ' count(v.id) as count ';

    let records = await sequelize.query(`select ${fields}
                            from video v 
                            inner join channel c on c.id = v.channelId 
                            inner join user u on u.id = c.userId 
                            right join watch_later wl on wl.videoId = v.id
                            where v.active=1 and v.visibility=1 and v.status='PUBLISHED' 
                            and c.active=1 and c.visibility=1 and c.status='PUBLISHED' 
                            and wl.userId = :userId and wl.active=1
                            order by wl.createdAt desc 
                            limit :limit offset :offset
                            `, {
                                type: QueryTypes.SELECT,
                                replacements: { userId: userId, limit : parseInt(limit), offset : parseInt(offset) }
                            });
    if(count)
        return records[0].count;
    else {
            return records.map(record => { 
                return {...record, createdAt: moment(record.createdAt, "YYYYMMDD").fromNow()}
            });
        }
}


let getVideosByCategoryId = async ({categoryId, limit, offset, count}) => {
        
    let fields = ` v.id, v.name, v.hash, v.description, v.channelId, v.poster, c.channelArt, v.active, v.userId, v.visibility, v.createdAt,
     c.name as channelName, concat(u.firstName,' ', u.lastName) as creator ,
     (select count(vw.id) from views vw where vw.active=1 and vw.videoId = v.id ) as views `;
    if(count)
        fields = ' count(v.id) as count ';

    let records = await sequelize.query(`select ${fields}
                            from video v 
                            left join channel c on c.id = v.channelId 
                            left join user u on u.id = c.userId 
                            where v.categoryId = :categoryId  
                            and v.active=1 and v.visibility=1 and v.status = 'PUBLISHED' 
                            and c.active=1 and c.visibility=1 and c.status='PUBLISHED' 
                            order by v.createdAt desc 
                            limit :limit offset :offset
                            `, {
                                type: QueryTypes.SELECT,
                                replacements: { categoryId: categoryId, limit : parseInt(limit), offset : parseInt(offset) }
                            });
    if(count)
        return records[0].count;
        else {
            return records.map(record => { 
                return {...record, createdAt: moment(record.createdAt, "YYYYMMDD").fromNow()}
            });
        }
}

let getMyVideos = async ({ userId, limit, offset, count }) => {
    let fields = ` temp.id, temp.name, temp.hash, temp.description, temp.channelId, temp.poster, temp.channelArt, temp.active,
    temp.visibility, temp.userId, temp.createdAt, temp.channelName, temp.creator, temp.likes, temp.views `;

    if(count)
        fields = ' count(temp.id) as count ';

    let records = await sequelize.query(`select ${fields} from (${temp}) temp 
    where temp.active=1  and temp.channelActive=1 and temp.userId = :userId 
    order by temp.createdAt desc limit :limit offset :offset `, 
        { 
            type: QueryTypes.SELECT,
            replacements: { userId: userId ,limit : parseInt(limit), offset : parseInt(offset) }
        });

    if(count)
        return records[0].count;
    else {
            return records.map(record => { 
                return {...record, createdAt: moment(record.createdAt, "YYYYMMDD").fromNow()}
            });
        }
}


let getArticleVideos = async({limit, offset, count}) => {
    let fields = `v.id, v.name, v.hash, v.description, v.channelId, v.poster, c.channelArt, v.active,v.visibility, v.userId, v.createdAt,
     c.name as channelName, concat(u.firstName,' ', u.lastName) as creator,
     (select count(vw.id) from views vw where vw.active=1 and vw.videoId = v.id ) as views `;
    if(count)
        fields = ' count(v.id) as count ';

    let records = await sequelize.query(`select ${fields}
                            from video v 
                            left join channel c on c.id = v.channelId 
                            left join user u on u.id = c.userId 
                            where v.active=1 and v.visibility=1 and v.status ='PUBLISHED'
                            limit :limit offset :offset
                            `, {
                                type: QueryTypes.SELECT,
                                replacements: { limit : parseInt(limit), offset : parseInt(offset) }
                            });
    if(count)
        return records[0].count;
    else {
            return records.map(record => { 
                return {...record, createdAt: moment(record.createdAt, "YYYYMMDD").fromNow()}
            });
        }
}


let getTrendingVideos = async({limit, offset, count }) => {

    let fields = ` temp.id, temp.name, temp.hash, temp.description, temp.channelId, temp.poster, temp.channelArt, temp.active,
    temp.visibility, temp.userId, temp.createdAt, temp.channelName, temp.creator, temp.likes, temp.views `;

    if(count)
        fields = ' count(temp.id) as count ';

    let records = await sequelize.query(`select ${fields} from (${temp}) temp 
    where temp.active=1 and temp.visibility=1 and temp.status='PUBLISHED' 
    and temp.channelActive=1 and temp.channelVisibility=1  and temp.channelStatus='PUBLISHED'
    order by temp.views desc limit :limit offset :offset `, 
        { 
            type: QueryTypes.SELECT,
            replacements: { limit : parseInt(limit), offset : parseInt(offset) }
        });

    if(count)
        return records[0].count;
    else {
            return records.map(record => { 
                return {...record, createdAt: moment(record.createdAt, "YYYYMMDD").fromNow()}
            });
        }
}



let getTopVideos = async({limit, offset, count}) => {
    let fields = ` temp.id, temp.name, temp.hash, temp.description, temp.channelId, temp.poster, temp.channelArt, temp.active,
    temp.visibility, temp.userId, temp.createdAt, temp.channelName, temp.creator, temp.likes, temp.views `;

    if(count)
        fields = ' count(temp.id) as count ';

    let records = await sequelize.query(`select ${fields} from (${temp}) temp 
    where temp.active=1 and temp.visibility=1 and temp.status='PUBLISHED' 
    and temp.channelActive=1 and temp.channelVisibility=1  and temp.channelStatus='PUBLISHED'
    order by temp.likes desc, views desc limit :limit offset :offset `, 
        { 
            type: QueryTypes.SELECT,
            replacements: { limit : parseInt(limit), offset : parseInt(offset) }
        });

    if(count)
        return records[0].count;
    else {
            return records.map(record => { 
                return {...record, createdAt: moment(record.createdAt, "YYYYMMDD").fromNow()}
            });
        }
}




let getLatestVideos = async({limit, offset, count}) => {
    let fields = ` temp.id, temp.name, temp.hash, temp.description, temp.channelId, temp.poster, temp.channelArt, temp.active,
    temp.visibility, temp.userId, temp.createdAt, temp.channelName, temp.creator, temp.likes, temp.views `;

    if(count)
        fields = ' count(temp.id) as count ';

    let records = await sequelize.query(`select ${fields} from (${temp}) temp
    where temp.active=1 and temp.visibility=1 and temp.status='PUBLISHED' 
    and temp.channelActive=1 and temp.channelVisibility=1  and temp.channelStatus='PUBLISHED'
     order by temp.createdAt desc, temp.views desc limit :limit offset :offset `, 
        { 
            type: QueryTypes.SELECT,
            replacements: { limit : parseInt(limit), offset : parseInt(offset) }
        });

    if(count)
        return records[0].count;
    else {
            return records.map(record => { 
                return {...record, createdAt: moment(record.createdAt, "YYYYMMDD").fromNow()}
            });
        }
}


let getSearchResult = async({words, limit, offset, all, count}) => {
    let replacements = {}, fields = ``;
    if(count)
        fields = ' count(v.id) as count ';
    else {
        if(all){
            fields = ` v.id, v.name, v.hash, v.description, v.channelId, v.poster, c.channelArt, v.active, v.userId, v.visibility, v.createdAt,
            c.name as channelName, concat(u.firstName,' ', u.lastName) as creator `;
        } else 
            fields = ` v.id, v.name, v.hash `;
    } 

        let sql = `select ${fields} from video v left join channel c on c.id = v.channelId 
        left join user u on u.id = c.userId where v.visibility=1 and v.active=1 and c.active=1 and c.visibility =1 and v.status = 'PUBLISHED' and c.status = 'PUBLISHED' `;

        let i=0;
        if(words.length > 0){
            sql += ' and ( ';
            for(let word of words){
                let k = 'word'+i;
                if(i==0)
                    sql += ` v.name like :${k} `;
                else 
                    sql += ` or v.name like :${k} `;
                replacements[k]='%'+word+'%';
                i++;
            }
            sql += ' ) ';
        }

        sql += `limit :limit offset :offset`;
        replacements['limit'] = parseInt(limit);
        replacements['offset'] = parseInt(offset);


        let records = await sequelize.query(sql, { type: QueryTypes.SELECT, replacements: replacements });
        if(count)
            return records[0].count;
        else {
            return records.map(record => { 
                return {...record, createdAt: moment(record.createdAt, "YYYYMMDD").fromNow()}
            });
        }
}


module.exports = {
    getVideoByHash : getVideoByHash,
    getRecommendation : getRecommendation,
    getVideosByChannelId : getVideosByChannelId,
    getMyVideosByChannelId : getMyVideosByChannelId,
    getSubscriptionVideos : getSubscriptionVideos,
    getWatchLaterVideos : getWatchLaterVideos,
    getVideosByCategoryId : getVideosByCategoryId,
    getMyVideos : getMyVideos,
    getArticleVideos : getArticleVideos,
    getTrendingVideos : getTrendingVideos,
    getTopVideos : getTopVideos,
    getLatestVideos : getLatestVideos,
    getSearchResult: getSearchResult
}