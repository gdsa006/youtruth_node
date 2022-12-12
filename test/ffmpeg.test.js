let ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');
ffmpeg.setFfprobePath('C:\\ffmpeg\\bin\\ffprobe.exe');

let file = 'E:\\upload\\videos\\eec14409c92b940c34bc96a65d31b3d1\\default\\eec14409c92b940c34bc96a65d31b3d1.mp4';

ffmpeg.ffprobe( file, (err, data) => {
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
    return meta;
})
