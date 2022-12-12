require('dotenv').config();
let path = require('path');
let fs = require('fs');
const uploadEnum = require('../enum/upload.enum');
const logger = require('../config/logger').getLogger('Upload Service');
let uploadDir = require('../config/uploadDirectory.config');
let md5 = require('md5');
const { getDateTimeString } = require('../helper/datetime.helper');



let createPathIfNotExist = async(dir) => {
    try {
        let exist = fs.existsSync(dir);
        if(!exist){
            fs.mkdirSync(dir, {recursive:true});
            logger.info('Path created');
        }
        logger.info('Path exist');
    }catch(err){
        logger.error(err);
        throw new Error(err);
    }
}

let isPathExist = async(dir) => {
    try {
        let exist = fs.existsSync(dir);
        return exist;
    }catch(err){
        logger.error(err);
        throw new Error(err);
    }
}


module.exports = {
    createPathIfNotExist,
    isPathExist,
    uploadBase64Img : async ({ chunk, mime, uploadType, email}) => {
        try {
            logger.info(`Uploading channel logo`);
            let dir = undefined;
            let filename = `${md5(email) + '-' + new Date().getTime()}.${mime}`;

            if(uploadType == uploadEnum.CHANNEL_POSTER){
                dir = await uploadDir.channel(email);
                filename = `${'poster_' + new Date().getTime()}.${mime}`;
            } else if(uploadType == uploadEnum.VIDEO_POSTER){
                dir = await uploadDir.videoPoster(email);
                filename = `${'video_' + new Date().getTime()}.${mime}`;
            } else if(uploadType == uploadEnum.PROFILE_IMAGE){
                dir = await uploadDir.profile(email);
                filename = `${'profile_' + new Date().getTime()}.${mime}`;
            }

            if(!dir)
                throw new Error('Invalid upload path: '+ dir);
            let text = chunk.split(';base64,').pop();
            fs.writeFileSync(path.join(dir.actual, filename), text ,{ flag:'a+', encoding: 'base64' });
            logger.info('File uploaded successfully');
            return {status:'success', file: dir.relative +'/'+ filename, baseDir: dir.relative, screenshots: ['NA',filename].join(',') };
        } catch(err){
            logger.error(err);
            return {status:'error'}
        }
    },
    uploadBase64Img_v2 : async ({ chunk, mime, uploadType, email}) => {
        try {
            logger.info(`Uploading channel logo`);
            let dir = undefined;

            if(uploadType == uploadEnum.CHANNEL_POSTER)
                dir = await uploadDir.channel(email);
            if(uploadType == uploadEnum.VIDEO_POSTER)
                dir = await uploadDir.videoPoster(email);
            if(uploadType == uploadEnum.PROFILE_IMAGE)
                dir = await uploadDir.profile(email);

            if(!dir)
                throw new Error('Invalid upload path: '+ dir);
            let filename = `${md5(email) + '-' + new Date().getTime()}.${mime}`;
            let text = chunk.split(';base64,').pop();
            fs.writeFileSync(path.join(dir.actual, filename), text ,{ flag:'a+', encoding: 'base64' });
            logger.info('File uploaded successfully');
            return {status:'success', file: dir.relative +'/'+ filename };
        } catch(err){
            logger.error(err);
            return {status:'error'}
        }
    },
    uploadBase64Video : async ({chunk, hash, mime, uploadType}) => {
        try {
            logger.info(`Uploading video chunk`)
            if(uploadType != uploadEnum.VIDEO)
                throw new Error('Invalid upload type enum');

            let dir = await uploadDir.videoDefault(hash);
            logger.info(dir)
            let filename = `${hash}.${mime}`;
            let text = chunk.split(';base64,').pop();
            let fullpath = path.join(dir.actual, filename);
            logger.info(fullpath);
            fs.writeFileSync(fullpath, text ,{ flag:'a+', encoding: 'base64' });
            logger.info('Video chunk uploaded successfully');
            return {status:'success', file: fullpath};
        } catch(err){
            logger.error(err);
            return {status:'error'}
        }
    },
    uploadBase64Video_v2 : async ({chunk, hash, mime, uploadType}) => {
        try {
            logger.info(`Uploading video chunk`)
            if(uploadType != uploadEnum.VIDEO)
                throw new Error('Invalid upload type enum');

            let dir = await uploadDir.videoDefault(hash);
            logger.info(dir)
            let filename = `${hash}.${mime}`;
            let text = chunk.split(';base64,').pop();
            let fullpath = path.join(dir.actual, filename);
            logger.info(fullpath);
            
            fs.writeFileSync(fullpath, text ,{ flag:'a+', encoding: 'base64' });
            logger.info('Video chunk uploaded successfully');
            return {status:'success', file: fullpath};
        } catch(err){
            logger.error(err);
            return {status:'error'}
        }
    },
    getBase64Image : async (dir) => {
        try {
            let exist = await isPathExist(dir);
            if(!exist)
                return null;
            else {
                let txt = fs.readFileSync(dir)
                let testCode64 = Buffer.from(txt).toString('base64');
                // let testDecode64 = Buffer.from(testCode64, 'base64').toString('utf-8');
                return `data:image/${dir.split('.')[1]};base64,${testCode64}`;
            }
        } catch(err){
            throw new Error(err);
        }
    }
}

