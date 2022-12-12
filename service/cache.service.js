class Cache{
    
    constructor(){
        this.videos = []; // [{path:'', hash:'', videoId: 1}]
    }

    put({hash, path, videoId}){
        this.videos.push({hash, path, videoId});
    }

    get({hash, videoId}){
        if(this.videos.length == 0)
            return null;
        else {
            if(hash){
                let v = this.videos.find(v => v.hash == hash );
                return v ? v.path : null
            } else if(videoId){
                let v = this.videos.find(v => v.videoId == videoId );
                return v ? v.path : null
            } else 
                return null;

        }
    }

    remove(videoId){
        if(this.videos.length == 0)
            return null;
        else {
            this.videos = this.videos.filter(v => v.videoId != videoId );
        }
    }

}
 let cache = new Cache();

module.exports = cache;