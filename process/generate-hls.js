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
        .addInput('C:\\Users\\acer\\Downloads\\test.webm')
        .outputOptions([
            '-map 0:v',
            '-map 0:v',
            '-map 0:a',
            '-map 0:a',
            '-s:v:0 426x240',
            '-c:v:0 libx264',
            '-b:v:0 400k',
            '-c:a:0 aac',
            '-b:a:0 64k',
            '-s:v:1 640x360',
            '-c:v:1 libx264',
            '-b:v:1 700k',
            '-c:a:1 aac',
            '-b:a:1 96k',
            //'-var_stream_map', '"v:0,a:0 v:1,a:1"',
            '-master_pl_name playlist.m3u8',
            '-f hls',
            '-max_muxing_queue_size 1024',
            '-hls_time 4',
            '-hls_playlist_type vod',
            '-hls_list_size 0',
            '-hls_segment_filename ./public/output/v%v/segment%03d.ts'
        ])
        .output('./public/output/v%v/master.m3u8')
        .on('start', function (commandLine) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
            res.write('<p>' + commandLine + '</p>');
        })
        .on('error', function (err, stdout, stderr) {
            console.error('An error occurred: ' + err.message, err, stderr);
            res.write('<p>' + err.message + '</p>');
        })
        .on('progress', function (progress) {
            console.log('Processing: ' + progress.percent + '% done');
            console.log(progress);
        })
        .on('end', function (err, stdout, stderr) {
            console.log('Finished processing!' /*, err, stdout, stderr*/);
            res.write('Finished processing!');
        })
        .run();
})