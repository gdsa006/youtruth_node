const { VideoFormat, Video } = require("../database/model");
const uploadDirectory = require('../uploadDirectory');
const videoFormatEnum = require("../enum/videoFormat.enum");
let path = require('path');

require('dotenv').config();

let ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
ffmpeg.setFfprobePath(process.env.FPROBE_PATH);
ffmpeg.setFlvtoolPath(process.env.FLVTOOL_PATH);

process.on('message', async ({hash, defaultFormatPath, videoId}) => {
    console.log(`video hash: ${hash} && path: ${defaultFormatPath} && videoId: ${videoId} && PID: ${process.pid}`);

    let { actual } = await uploadDirectory.video720p(hash);

    ffmpeg(defaultFormatPath)
            .withOutputFormat('mp4')
            .on('end', async() => {
                try{
                console.log(`process ${process.pid} converted video into mp4`);
                await VideoFormat.create({ 
                    videoId:videoId, 
                    videoPath: path.join(actual,`${hash}.mp4`), 
                    meta:'{}', 
                    resolution: videoFormatEnum.V720P, 
                    status:1 });
                }catch(err){
                    console.log(err);
                }finally{
                    process.kill(process.pid);
                }
            })
            .on('error', err => {
                console.log(`Process ${process.pid} got error while converting video into mp4 : ${err}`);
                process.kill(process.pid);
            })
            .on('progress',(meta) => {
                console.log(`${new Date()} on progress....${meta}`)
            })
            .size('720x480')
            .aspect('4:3')
            .videoCodec('libx264')
            .audioCodec('libmp3lame')
            .saveToFile(path.join(actual,`${hash}.mp4`));
})