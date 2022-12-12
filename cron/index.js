let cron = require('node-cron');
let cronEnum = require('../enum/cron.enum');
let logger = require('../config/logger').getLogger('CRON : ')

let cronList = {};

let init = () => {
    
    // 1. hls generator cron
    // let hls_generator = cron.schedule('10 * * * * *', () => {
    //     logger.info('CRON SCHEDULED :=> '+ cronEnum.HLS_VIDEO_GENERATOR);
    // });
    // cronList[cronEnum.HLS_VIDEO_GENERATOR] = hls_generator;

    // 2. video upload error cleanup cron
    // let incomplete_video_cleanup = cron.schedule('5 * * * * *', () => {
    //     logger.info('CRON SCHEDULED :=> '+ cronEnum.INCOMPLETE_UPLOAD_CLEANUP);
    // });
    // cronList[cronEnum.INCOMPLETE_UPLOAD_CLEANUP] = incomplete_video_cleanup;

}

let destroy = () => {
    let keys = Object.keys(cronList);
    if(keys.length > 0){
        keys.map(key => {
            try {
                cronList[key].stop();
            } catch(error){
                logger.error('CRON ERROR :=> '+ error);
            }
        })
    } else 
        logger.info('NO CRON FOUND TO DESTROY ');
}

let destroyByKey = (key) => {
    if(cronList.hasOwnProperty(key)){
        try {
            cronList[key].stop();
        } catch(error){
            logger.error('CRON ERROR :=> '+ error);
        }
    } else {
        logger.info('NO CRON KEY FOUND TO DESTROY ');
    }
}


module.exports = {
    start : init,
    stop : destroy,
    stopByKey : destroyByKey
}