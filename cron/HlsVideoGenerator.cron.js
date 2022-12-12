
let path = require('path');

let ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath('C:ffmpeg\\bin\\ffmpeg.exe');
ffmpeg.setFfprobePath('C:ffmpeg\\bin\\ffprobe.exe');

let file = 'C:/Users/acer/Downloads/MummyKassam.mp4';


let outputOptions = [
    '-preset superfast',
    '-keyint_min 100',
    '-g 100', 
    '-sc_threshold 0',
    '-r 25', 
    '-c:v libx264',
    '-pix_fmt yuv420p',

    '-map v:0',
    '-s:0 960x540',
    '-b:v:0 2M',
    '-maxrate:0 2.14M',
    '-bufsize:0 3.5M',

    '-map v:0', 
    '-s:1 416x234', 
    '-b:v:1 145k', 
    '-maxrate:1 155k', 
    '-bufsize:1 220k',

    '-map v:0',
    '-s:2 640x360',
    '-b:v:2 365k', 
    '-maxrate:2 390k', 
    '-bufsize:2 640k',

    '-map a:0', 
    '-map a:0', 
    '-map a:0', 
    '-c:a aac', 
    '-b:a 128k', 
    '-ac 1', 
    '-ar 44100',

    '-f hls', 
    '-hls_time 5',
    '-hls_playlist_type vod', 
    '-hls_flags independent_segments',
    '-master_pl_name ./output/master.m3u8',
    '-hls_segment_filename ./output/stream_%v/s%06d.ts',
    '-strftime_mkdir 1'
]
const command = ffmpeg(file)
      .outputOptions(outputOptions)
      .output(path.join(__dirname,'output','./stream_%v.m3u8'))
      .on('progress', function(progress) {
        console.log('Processing: ' + progress.percent + '% done')
      })
      .on('end', function(err, stdout, stderr) {
        console.log('Finished processing!' /*, err, stdout, stderr*/)
      })
      .run() 