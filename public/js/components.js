
let headers = {
    "mode" : "cors",
    "credentials" : "include",
    "content-type" : "application/json"
}

//-----------------------------------------------------------------------------------------------------------------
//---------------------------------------------------component------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------

let NoDataFound = () => {
    return `
        <div class="col-sm-12">
            <div class="bd-callout bd-callout-warning">
                <p class="text-center">No data found</p>
            </div>
        </div>
    `;
}

let videoThumbnail = (video) => {
    return (`
        <div class="videothumbs">
            <div class="thmbsimg">
                <div title="${video.name}" class="video-thumb-img" onclick="javascript:redirect('/watch/video?hash=${video.hash}')"><i class="fas fa-4x fa-play-circle"></i></div>
            </div>
            <div class="sortdetails">
                <div class="channeldp">
                    <img src="https://i.pinimg.com/236x/db/ea/af/dbeaaf2ad67ffc92cc2fbaa501527220.jpg" alt="">
                </div>
                <h4>${video.name}</h4>
                <p> <span class="creatorname">${video.creator}</span>
                    <span class="totalviews">0 Views</span>  
                    <span class="seprater"><i class="fas fa-circle"></i></span>  
                    <span class="uploaddate">${video.createdAt}</span>
                </p>
            </div>
        </div>`);
}

let channelThumbnail = (channel) => {
    return (`
        <div class="videothumbs">
            <div class="thmbsimg">
                <div title="${channel.name}" class="video-thumb-img" onclick="javascript:redirect('/user/view/channel/videos?channel_id=${channel.id}&page=channel_videos')">
                    <i class="fas fa-4x fa-folder-open"></i>
                </div>
            </div>
            <div class="sortdetails">
                <div class="channeldp">
                    <img src="https://i.pinimg.com/236x/db/ea/af/dbeaaf2ad67ffc92cc2fbaa501527220.jpg" alt="">
                </div>
                <h4>${channel.name}</h4>
                <p> <span class="creatorname">${channel.firstName} ${channel.lastName}</span>
                    <span class="totalviews">${channel.videoCount} Videos</span>  
                    <span class="seprater"><i class="fas fa-circle"></i></span>  
                    <span class="uploaddate">${channel.visibility == 1 ? 'Public' : 'Private'}</span>
                </p>
            </div>
        </div>`);
}


//-------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------ VIEW CLASS-------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------- 


class ProfileSetting {

    constructor(el){
        this.el = el;
        this.user = undefined;

        this.init();
    }

    init = () => {
        this.profile();
    }

    viewInit = () => {

    }


    profile = () => {
        fetch('/account/user/profile',{
            headers : headers
        }).then(response => response.json())
        .then(json => {
            this.user = json.data.user;
            this.render();
        })
    }


    html = async () => {
        if(this.user){
            return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-12">
                        <div class="sectionheading">
                            <h2>Profile Settings</h2>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6 mb-2">
                        <div id="public-info">
                            <form class="card">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="text-center">
                                                <img alt="Chris Wood" src="http:///unsplash.it/36/36?gravity=center"
                                                    class="rounded-circle img-responsive mt-2" style="width: 128px; height:128px;">
                                                <div class="mt-2">
                                                    <button class="btn btn-danger btn-sm">Upload</button>
                                                </div>
                                                <small>For best results, use an image at least 128px by 128px in .jpg format</small>
                                            </div>
                                            <div class="form-group">
                                                <label for="inputUsername" >Username</label>
                                                <input id="inputUsername"  type="text" class="form-control">
                                            </div>
                                            <div class="form-group">
                                                <label for="inputBio" >Biography</label>
                                                <textarea rows="2" id="inputBio" class="form-control"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="btn btn-danger btn-sm">Save changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="tab-pane active" id="user-account" role="tabpanel">
                            <form class="card">
                                <div class="card-body">
                                    <div class="form-row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="firstName" class="">Firstname</label>
                                                <input name="text" id="firstName" type="text" class="form-control"></div>
                                            </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="lastName" class="">Lastname</label>
                                                <input name="text" id="lastName" type="text" class="form-control">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="firstName" class="">Gender</label>
                                                <select  id="gender" class="form-control">
                                                    <option value=""></option>
                                                    <option value="M">Male</option>
                                                    <option value="F">Female</option>
                                                    <option value="O">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="dob" class="">Date Of Birth</label>
                                            <input name="text" id="dob" type="text" class="form-control">
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label for="email" class="">Email</label>
                                            <input disabled="disabled" id="email" type="email" class="form-control">
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label for="address">Address</label>
                                            <textarea name="address" id="address" rows="3" class="form-control"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <button class="btn btn-danger btn-sm">Save changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;
        } else {
            return `<h1>Loading...</h1>`
        }
    }

    render = async () => {
        this.el.innerHTML = await this.html();
        this.viewInit();
    }
}

class Profile {

    constructor(el){
        this.el = el;
        this.user = undefined;
        this.img = undefined;

        this.init();
        
    }

    init = () => {
        this.profile();
        this.profileImg();
    }

    gender = () => {
        if(this.user){
            if (this.user.gender == 'M')
                return 'Male';
            else if(this.user.gender == 'F')
                return 'Female';
            else 
                return 'Other' 
        } else 
            return 'N.A'
    }

    profileImg = () => {
        fetch('/account/profile/img',{
            headers : headers
        }).then(response => response.json())
        .then(json => {
            this.img = json.data['profileImg'];
            this.render();
        })
    }

    profile = () => {
        fetch('/account/user/profile',{
            headers : headers
        }).then(response => response.json())
        .then(json => {
            this.user = json.data.user;
            this.render();
        })
    }

    html = async () => {
        if(this.user)
            return `
            <div class="row">
                <div class="col-sm-12">
                    <div class="sectionheading">
                        <h2>Profile</h2>
                        <a href="/account/view/profile/setting">Profile Setting <i class="fas fa-angle-double-right"></i></a>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="row gutters-sm ">
                        <div class="col-md-4 mb-3">
                            <div class="d-flex flex-column align-items-center text-center">
                                <img src="${this.img}" alt="Admin" class="rounded-circle" style="height:200px;width:200px;">
                                <div class="mt-3">
                                    <h4> ${this.user.firstName} ${this.user.lastName} </h4>
                                    <small class="text-muted" >${this.user.email}</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8">
                            <h5 class="card-title">About</h5>
                            <ul class="list-unstyled mb-0">
                                <li class="mb-1"><i class="far fa-envelope-open"></i> Mail at <span class="text-secondary">${this.user.email}</span></li>
                                <li class="mb-1"><i class="fas fa-home"></i> Lives in <span class="text-secondary">${this.user.address}</span></li>
                                <li class="mb-1"><i class="fas fa-calendar-week"></i> Born on <span class="text-secondary">${this.user.dob}</span></li>
                                <li class="mb-1"><i class="fas fa-mobile"></i> Call me <span class="text-secondary">${this.user.mobile}</span></li>
                                <li class="mb-1"><i class="fas fa-venus-mars"></i> I'm <span class="text-secondary" >${this.gender()}</span></li>
                                <li class="mb-1"> <i class="fas fa-info-circle"></i> Biography </li>
                                <li class="border-left border-info p-2 mt-2">
                                    <span class="text-secondary" id="userBio">${this.user.bio ? this.user.bio : 'N.A'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        else 
            return `<h1>Loading...</h1>`
    }

    async render(){
        this.el.innerHTML = await this.html();
    }
}


class VideoMediaPlayer {

    constructor(el, hash){
        this.hash = hash;
        this.el = el;
    }

    html = async () => `
    <video id="my-video" class="video-js" data-setup="{}" preload="metadata" controls autoplay style="background-color: #000 !important;min-height:300px;">
        <source src="/stream/video?hash=${this.hash}" type="video/mp4">
        <source src="/stream/video?hash=${this.hash}" type="video/webm">
        Your browser does not support the video tag.
    </video>
    `

    viewInit(){
        let player = videojs('#my-video',{
          autoPlay:false,
          controls: true,
          playbackRates: [-10, -5, -2, -1, -0.5, 0.5, 1, 2, 5, 10]
        });

        player.touchOverlay({
          seekLeft: {},
          play: {},
          seekRight: {}
        });
        $('.vjs-big-play-button').css({'display':'none'});
    }


    async render(){
        this.el.innerHTML = await this.html();
        this.viewInit();
    }
}


class VideoDetails {

    constructor(el, props){
        this.video = props.video;
        this.isLoggedIn = props.isLoggedIn;
        this.hash = props.video.hash;
        this.likeCount = props.likeCount;
        this.subscribeCount = props.subscribeCount;
        this.isLiked = props.isLiked;
        this.isSubscribed = props.isSubscribed;
        this.el = el;
        this.isMarkedWatchLater = props.isMarkedwatchLater;
    }

      
    doLikeUnLike = (e) => {
        e.preventDefault();
        if(!this.isLoggedIn){
            return window.location = '/auth/login';
        }
        let url = this.isLiked ? '/user/video/unlike' : '/user/video/like';
        http().post({url:url, data : {videoHash : this.hash}}).then(r => {
            console.log(r);
            this.likeCount = r.likeCount;
            this.isLiked = ! this.isLiked;
            this.render();
        });
        return false;
    }

    doSubscribeUnSubscribe = (e) => {
        e.preventDefault();
        if(!this.isLoggedIn){
            return window.location = '/auth/login';
        }
        let url = this.isSubscribed ? '/user/video/unsubscribe' : '/user/video/subscribe';
        http().post({url:url, data : {channelId : this.video.Channel.id}}).then(r => {
            console.log(r);
            this.subscribeCount = r.subscribeCount;
            this.isSubscribed = ! this.isSubscribed;
            this.render();
        });
        return false;
    }

    markAsWatchLater = (e) => {
        e.preventDefault();
        if(!this.isLoggedIn){
            return window.location = '/auth/login';
        }
        let url = this.isMarkedWatchLater ? '/user/video/unmark-watch-later' : '/user/video/mark-watch-later';
        http().post({url:url, data : {videoHash : this.hash}}).then(r => {
            console.log(r);
            this.isMarkedWatchLater = ! this.isMarkedWatchLater;
            this.render();
        });
        return false;
    }

    html = async () => {

        let likeLink = this.isLoggedIn ? `javascript: false` : '/auth/login';
        let subscribeLink = this.isLoggedIn ? `javascript: false` : '/auth/login';

        return `
                <div class="videotitle">
                    <div class="channeldp"><img src="https://i.pinimg.com/236x/db/ea/af/dbeaaf2ad67ffc92cc2fbaa501527220.jpg"
                        alt=""></div>
                    <h1 id="video-title">${this.video.name}</h1>
                </div>
                <div class="videoOptions">
                    <div class="views-upload">
                    <span class="totalviews"><span id="video-views"></span> ${this.video.views} Views</span>
                    <span class="seprater"><i class="fas fa-circle"></i></span>
                    <span class="uploaddate" id="video-date">${this.video.createdAt}</span>
                    </div>
                    <div class="vidoption">
                    <ul>
                        <li>
                            <a href="#" class="likes ${this.isMarkedWatchLater ? 'bg-primary' : ''}" id="mark-as-watch-later">
                                <i class="fas fa-clock"></i>
                                Watch Later
                            </a>
                        </li>
                        <li>
                            <a href="#" class="likes" id="do-like-unlike">
                                <i class="fas fa-thumbs-up"></i>
                                <span id="video-like-count">${this.likeCount}</span> 
                                ${this.isLiked ? 'Liked' : 'Like'}
                            </a>
                        </li>

                        <li>
                            <a href="#" class="subscribe" id="do-subscribe-unsubscribe"> 
                                <span id="video-subscription-count">${this.subscribeCount}</span> 
                                ${this.isSubscribed ? 'Subscribed' : 'Subscribe'}
                            </a>
                        </li>
                    </ul>
                    </div>
                </div>
                <div class="video-details">
                    <h4><i class="fas fa-tag"></i> <span id="video-category">${this.video.VideoCategory.name}</span></h4>
                    <p><span id="video-description">${this.video.description}</span></p>
                </div>
            `;
    }

    async render(){
        this.el.innerHTML = await this.html();
        document.getElementById('do-like-unlike').addEventListener('click',this.doLikeUnLike);
        document.getElementById('do-subscribe-unsubscribe').addEventListener('click', this.doSubscribeUnSubscribe);
        document.getElementById('mark-as-watch-later').addEventListener('click', this.markAsWatchLater);
    }
}

class VideoRecommendation {
    constructor(el, hash){
        this.el = el;
        this.hash = hash;
    }

    html = async () => {
        let recommendation = await http().get({url:`/video/recommendation?hash=${this.hash}&page=1&size=5`});
        let recommendationHtml = `No video found`;
        
        if(recommendation.status = 'success' && recommendation.videos && recommendation.videos.length > 0){
            recommendationHtml = recommendation.videos.map(v => videoThumbnail(v)).join('')
        }
        return recommendationHtml;
    }

    async render(){
        this.el.innerHTML = await this.html();
    }
}


// Component end----------------------------------
