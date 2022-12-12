// MVC framework

// Plugin && startup functions



function loadFormTransition(){
    $('input,textarea,select').on('focusin', function() {
        $(this).parent().find('label').addClass('active');
    });
  
    $('input,textarea,select').on('focusout', function() {
        if (!this.value) {
            $(this).parent().find('label').removeClass('active');
        }
    });

    $('input,textarea,select').each(function() {
        if (this.value) {
            $(this).parent().find('label').addClass('active');
        }
    });
}

loadFormTransition();

let headers = {
    "mode" : "cors",
    "credentials" : "include",
    "content-type" : "application/json"
}

// Store plugin

let Store = {
    get : ({key, refresh=false}, callback) => {
        if(localStorage[key] && !refresh){
            callback(localStorage.getItem(key)? JSON.parse(localStorage.getItem(key)) : undefined);
        } else {
            switch(key){
                case 'category' : 
                    http().get({url:'/api/video/categories'}).then(r => {
                        localStorage.setItem(key, JSON.stringify(r.categories));
                        callback(localStorage.getItem(key)? JSON.parse(localStorage.getItem(key)) : undefined);
                    })
                    break;
                case 'avatar' : 
                    http().get({url:'/api/fs/user/profile-image'}).then(r => {
                        localStorage.setItem(key, JSON.stringify(r));
                        callback(localStorage.getItem(key)? JSON.parse(localStorage.getItem(key)) : undefined);
                    })
                    break;
                case 'stdCode' : 
                    http().get({url:'/data/std.json'}).then(r => {
                        localStorage.setItem(key, JSON.stringify(r));
                        callback(localStorage.getItem(key)? JSON.parse(localStorage.getItem(key)) : undefined);
                    })
                    break;
                default : 
                    console.log('No data found in cache')
            }
        }
    }
}


// loading button


let loading = {
    btn : (btn) => {
        if(btn.hasClass('disabled')) {
            btn.removeClass('disabled');
            btn.html(btn[0].dataset.label)
        } else {
            btn.addClass('disabled')
            btn.html('<i class="fa fa-spinner fa-spin"></i> Loading')
        }
    },
    page : () => {

    }
}

// toaster plugin

let alert = {
    info : (json) => {
        if(json.status == 'success'){
            if(json.message)
                $.toast({text:json.message,heading:'Success',position:'bottom-right',bgColor:'#2ecc71',textColor:'#fff'})
        }else {
            if(json.validation && json.validation.length > 0){
                json.validation.map(m => {
                    $.toast({text:m,heading:'Error',position:'bottom-right',bgColor:'#d9534f',textColor:'#fff'})
                })
            }
        }
    },
    error : (msg) => {
        $.toast({text:msg,heading:'Error',position:'bottom-right',bgColor:'#d9534f',textColor:'#fff'});
    },
    warning : (msg) => {
        $.toast({text:msg,heading:'Warning',position:'bottom-right'});
    }
}

// http plugin

let http = () => {
    this.method = 'GET';
    this.data = {};
    this.headers = {'content-type' : 'application/json'};
    this.btn = undefined;

    this.post = ({url, form = undefined, data = {}, headers = undefined, btn = undefined}) => {
        this.method = 'POST';
        form ? form.serializeArray().map(ob => this.data[ob.name]=ob.value) : this.data = data;
        if(headers) this.headers = headers;
        this.btn = btn;
        if(this.btn) loading.btn(btn);
        return this.call(fetch(
            url,{
                method : this.method,
                mode:'cors',
                credentials: 'same-origin', 
                headers : this.headers,
                body: JSON.stringify(this.data)
            }
        ));
    }

    this.get = ({url, form = undefined, headers = undefined, btn=undefined}) => {
        this.method = 'GET';
        if(headers) this.headers = headers;
        if(form){
            let query = form.serialize();
            url = url + '?' + query;
        }
        this.btn = btn;
        if(this.btn) loading.btn(this.btn);
        return this.call(fetch(
            url,{
                method : this.method,
                mode:'cors',
                credentials: 'same-origin', 
                headers : this.headers
            }
        ));
    }

    this.call = (f) => {
        return new Promise((resolve, reject) => { 
            f.then(response => response.json())
            .then(json => {
                if(this.btn) loading.btn(this.btn);
                alert.info(json);
                json.status == 'success' ? resolve(json.data) : reject(json)
            }).catch( err => {
                if(this.btn) loading.btn(this.btn);
                alert.error(err);
                reject(err);
            })
        })
    }

    return {
        get: this.get,
        post: this.post
    };
}


Store.get({key : 'category'}, d => {
    // $('#sidebar-navigation').append('<h4>Categories</h4>');
    d.map(c => {
        $('#sidebar-navigation').append(`<a href="#/video/category?name=${c.name}&id=${c.id}" class="item_menu page-view"><i class="${c.fontAwesomeClass}"aria-hidden="true"></i>${c.name}</a>`)
    })
})

Store.get({key : 'stdCode',refresh: true}, d => {
    console.log('STD code loaded');
})

function loadProfileImage({refresh=false}){
    Store.get({key:'avatar', refresh}, d => {
        let userProfileImage = $(".user-profile-image");
        if(userProfileImage)
            userProfileImage.attr('src', d.image);
    });
}

loadProfileImage({});

// Reset Password
let setNewPasswordFrom = $('#set-new-password');
let setNewPasswordBtn = $('#submit-reset-password');

let rule = formRule.resetPassword;
setNewPasswordFrom.validate(rule);

setNewPasswordBtn.on('click', () => {
    if(setNewPasswordFrom.valid()){
        let data = {
            npassword: md5($('#npassword').val()),
            cpassword: md5($('#cpassword').val()),
            _csrf: $('#_csrf').val(),
            token: $('#token').val(),
            serial: $('#serial').val()
        }
        http().post({url:'/api/auth/reset/password/submit', data: data, btn: setNewPasswordBtn}).then(res => {
            console.log(res);
            $('#form-part-2').css('display','block');
            $('#form-part-1').css('display','none')
        }).catch(err => {
            console.log(err)
        })
    }
})

// end

// base64 Plugin 
function getBase64(f, callback){
    if(f.size >= 1000000){
        alert.error('Maximum of 1mb of file size you can upload');
        return;
    }
    let reader = new FileReader();
    reader.onload = ()=>{
        callback(reader.result);
    }
    reader.readAsDataURL(f);
}

// Upload Plugin
function uploadChunk( {uri, file = undefined, chunkSize = undefined, hash = undefined, el = undefined} , callback ){

    this.uri = uri;
    this.reader = new FileReader();
    this.size = file.size;
    this.name = file.name;
    this.type = file.type;
    this.hash = hash ? hash : md5(file.name.concat(file.size).concat(file.type).concat(new Date().getTime()))
    this.nextChunk = 0; // bytes
    this.startChunk = 0; //bytes
    this.totalChunks = 0; //bytes
    this.uploadedSize = 0; //bytes
    this.currentChunkIndex = 0;
    this.chunkSize = chunkSize ? chunkSize : 1000000/2; // 0.5 mb
    this.file = file;
    this.chunk = undefined;

    this.init = () => {
        this.totalChunks = Math.ceil(this.size / this.chunkSize);
        this.startUpload(0);
        $(el).html(`
        <div class="progress" >
            <div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar"
            aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width:0%">
            0% Complete
            </div>
        </div>
        `)
    }
    
    this.startUpload = (start) => {
        this.startChunk = start;
        this.nextChunk = this.startChunk + this.chunkSize + 1;
        if(this.file){
            this.chunk = this.file.slice(this.startChunk, this.nextChunk)
        } else {
            console.log('File attachment is required')
            return;
        }

        this.reader.onload = (e) => {
            this.currentChunkIndex++;
            this.upload(reader.result, this.currentChunkIndex);
        }
        this.reader.readAsDataURL(this.chunk);
    }


    this.upload = (base64, seq) => {
        let data = {
            start: this.startChunk,
            end: this.nextChunk,
            total: this.size,
            name: this.name,
            type: this.type,
            chunkIndex: seq,
            totalChunk: this.totalChunks,
            chunk: base64,
            hash: this.hash,
            mime : this.name.substring(this.name.lastIndexOf('.')+1)
        }
        fetch('/api/account/post/file/upload', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
            .then(json => {
                if (json.status == 'success') {
                    // console.log(`uploaded successfully index : ${seq}`)
                    this.uploadedSize = this.uploadedSize + this.chunkSize;
                    let percentageValue = ((this.uploadedSize / this.size) * 100).toFixed(0);
                    let percentageText =  (percentageValue <= 100 ? percentageValue : 100) + '%';
                    // console.log(percentageText)
                    // console.log(json.data)
                    $(el + " .progress .progress-bar").css('width', percentageText);
                    if(json.data.uploadFlag != 1)
                        $(el + " .progress .progress-bar").html(percentageText);
                    else
                        $(el).html('<p class="text-success">Upload Finished!</p>');
                    if (this.nextChunk < this.size && json.data.uploadFlag == 0)
                        this.startUpload(this.nextChunk);
                    else{
                        callback({
                            result: json,
                            status: 'success'
                        })
                    }
                }
            }).catch(err => {
                console.log(err);
            })
    }

    this.init()
}


// initialize videoJs
let vjs = undefined;
function initializePlayer(){
    if(vjs) {
        vjs.dispose();
    }
        vjs = videojs("#video-tag", {
            title: 'new video title',
            playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
        });

        vjs.seekButtons({
            forward: 30,
            back: 30
          });
    return vjs;
}


// search bar
let videoList = [];
let searchInput = $("#searchinput");
let searchResult = $("#search-result");
let searchResultLi = (text) => `<li><a href="#/video/watch?id=${text.id}&hash=${text.hash}" class="pr-2"><i class="fas fa-search"></i> ${text.name}</a></li>`;
let noResultLi = (text) => `<li><a href="javascript:void()" class="pr-2"><i class="fas fa-search"></i> ${text}</a></li>`;

searchInput.on('keyup', debounce((e) => {
    if(e.target.value.length > 2){
        http().get({url:`/api/search/suggestions?q=${encodeURI(e.target.value)}`}).then(r => {
            searchResult.empty();
            if(r.records && r.records.length > 0){
                r.records.map(text => searchResult.append(searchResultLi(text)));
                videoList = r.records;
                $(".search-suggestions").css('display','block');
            } else {
                searchResult.append(`<li><center><a href="javascript:void" class="pr-2"><i class="fas fa-ghost"></i> No match found !</a></center></li>`)
                $(".search-suggestions").css('display','block');
            }
        }).catch(err => {
            searchResult.empty();
            searchResult.append(noResultLi('No result found'));
        })
    }else
    clearSearch()
},500));

function clearSearch(){
    searchResult.empty();
    $(".search-suggestions").css('display','none');
}

searchInput.on('focusout', () => {
    setTimeout(()=> {
        $(".search-suggestions").css('display','none');
    },500)
})


searchInput.on('focusin', () => {
    if(videoList.length > 0)
        $(".search-suggestions").css('display','block');
})


function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function getSearchResults(){
    let searchText = searchInput.val();
    mvc.navigate({path: `/search?q=${encodeURI(searchText)}`});
    clearSearch();
}



// HTML TEMPLATES

// let ViPlayer = ({hash}) => {
//     return (`
//         <div class="stream-player" id="stream-player" style="background-color:#000000e0;position: relative;height:450px;">
//             <div style="position:absolute;top:0;right:0;left:0;color:#fff;z-index: 6;display:flex;padding:15px;">
//                 <div class="left" style="width:70%;display:flex;justify-content: flex-end;">
//                 </div>
//                 <div class="left" style="width:30%;display:flex;justify-content: flex-end;">
//                 </div>
//             </div>
//             <video id="video-tag" class="video-js vjs-big-play-centered" controls
//                         style="position: absolute;top: 0;right: 0;bottom: 0;left: 0;height: auto;width: 100%;margin:auto;object-fit: fill;">
//                 <source src="/api/stream/video?hash=${hash}&format=default" type='video/mp4' />
//                 <source src="/api/stream/video?hash=${hash}&format=default" type='video/mp4' />
//                 <source src="/api/stream/video?hash=${hash}&format=default" type='video/webm' />
//                 <source src="/api/stream/video?hash=${hash}&format=default" type='video/webm' />
//             </video>
//         </div>
//     `)
// }

let ViPlayer = ({hash}) => {
    return (`
        <div class="stream-player" id="stream-player" style="background-color:#000000e0;position: relative;height:450px;">
            <video id="video-tag" class="video-js vjs-big-play-centered vjs-theme-city" controls
                        style="position: absolute;right: 0;bottom: 0;top: 0;left: 0;height: 100%;width: 100%;object-fit: fill;overflow:hidden;">
                <source src="/api/stream/video?hash=${hash}&format=default" type='video/mp4' />
                <source src="/api/stream/video?hash=${hash}&format=default" type='video/mp4' />
                <source src="/api/stream/video?hash=${hash}&format=default" type='video/webm' />
                <source src="/api/stream/video?hash=${hash}&format=default" type='video/webm' />
            </video>
            <div style="position:absolute;top:0;right:0;left:0;color:#fff;z-index: 6;padding:15px;">
                <div class="player-controls">
                </div>
            </div>
        </div>
    `)
}

let modal = ({ id, body, heading }) => {
    return (`
        <div class="modal fade" id="${id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" >${heading}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="close-modal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" id="update-channel-form-wrapper">
                        ${body}
                    </div>
                </div>
            </div>
        </div>
    `)
}

let NoDataFound = ({msg}) => {
    let template = `<div class="no-data-found"><p class="text-muted" style="text-align:center;font-size: 25px;padding:25px;margin:100px;"><i class="fas fa-ghost"></i> <span>${msg}</span></p></div>`;
    return {
        render : (el) => document.getElementById(el).innerHTML = template,
        html : () => template
    }
}

let Loading = () => {
    return (`<div class="container-fluid">
                <div class="row">
                    <div class="col-md-12">
                        <div style="padding:25px">
                            <center>
                            <div class="spinner-border" role="status">
                                <span class="sr-only">Loading...</span>
                            </div> 
                            <span style="font-size: 16px;padding: 0px 10px;">Loading...</span>
                            </center>
                        </div>
                    </div>
                </div>
            </div>`);
}

let PageHeading = ({back={show: true, link: undefined}, heading, subHeading= undefined, next=[]}) => {
    return (`
    <div class="row">
        <div class="col-md-12">
            <div class="section-heading-v2">
                <div class="d-flex flex-row flex-wrap justify-content-between align-items-start">
                    <div class="left">
                        <div class="d-inline-block"> 
                            ${ back.show ? `<a href="${back.link ? back.link : 'javascript:window.history.back()'}" ><i class="fas fa-2x fa-arrow-circle-left text-danger"></i></a>` : ''} 
                            <span class="heading-label">${heading}</span>
                        </div>
                    </div>
                    
                    <div class="right px-2">
                        ${next.length > 0 ? next.map(n => `<a href="${n.link}" class="btn btn-sm btn-hover-red ml-1">${n.label}</a>`).join('') : ''}
                    </div>
                </div>
                ${subHeading ? `<div class="sub-heading">${subHeading}</div>`:``}
            </div>
        </div>
    </div>
    `)
}

let MyVideoThumbnail= ({video}) => {
    let poster = '/static/assets/images/video-thumbs/2.webp';
    if(video.poster){
        let {baseDir, screenshots } = JSON.parse(video.poster);
        if(baseDir && screenshots && screenshots.length > 0)
            poster = baseDir.concat('/' + screenshots[1]);
    }  
    
    return (`
            <div class="videothumbs">
                <div class="thmbsimg" style="background-image:url(${poster});background-size:cover">
                    <div class="middle">
                        <a href="javascript:MyChannelVideos.playVideoInPopUp('${video.hash}','${video.name}')" class="page-view">
                            <div class="text"><i class="fa fa-play" aria-hidden="true"></i></div>
                        </a>
                    </div>
                </div>
                <div class="sortdetails">
                    <div class="channeldp">
                        <img src="${video.channelArt}" alt="">
                    </div>
                    <h4>${video.name}</h4>
                    <p>
                        <span class="totalviews">${video.views} Views</span>  
                        <span class="seprater"><i class="fas fa-circle"></i></span>  
                        <span class="uploaddate">${video.createdAt}</span>
                    </p>
                    <p>        
                        <span class="uploaddate ${video.status == 'REJECTED' ? 'text-danger': ''}">${video.status == 'PENDING' ? 'NOT PUBLISHED': video.status }</span>
                        <span class="seprater"><i class="fas fa-circle"></i></span> 
                        <span class="uploaddate">${video.visibility == 1 ? 'PUBLIC' : 'PRIVATE'}</span>                  
                    </p>
                    <p>
                        <button class="btn btn-danger btn-sm btn-round mr-1" title="Delete Video" onclick="MyChannelVideos.deleteVideo('${video.hash}',${video.channelId })" > <i class="fas fa-trash"></i></button>
                        <button class="btn btn-info btn-sm btn-round" title="Update Video" onclick="MyChannelVideos.updateVideo('${video.hash}',${video.channelId })" > <i class="fas fa-edit"></i></button>
                    </p>
                </div>
            </div>`);
}

let MyChannelThumbnail = ({channel}) => {
    return (`
        <div class="channel-thumbs">
            <div class="thmbsimg" style="background-image:url(${channel.channelArt});background-size:cover">
                <div class="chvideocount">
                    <i class="fa fa-indent" aria-hidden="true"></i>
                    ${channel.videoCount}
                </div>
                <div class="middle">
                    <a href="#/user/channel/videos?id=${channel.id}&name=CHANNEL_VIDEOS" class="page-view">
                        <div class="text"><i class="fa fa-play" aria-hidden="true"></i>View All</div>
                    </a>
                </div>
            </div>
            <div class="sortdetails">
                <div class="channeldp">
                    <img src="${channel.channelArt}" alt="">
                </div>
                <h4>${channel.name}</h4>
                <p> <a class="page-view" href="#/ti/user?userId=${channel.userId}"><span class="creatorname capitalize">${channel.firstName} ${channel.lastName}</a></span>
                    <span class="totalviews">${channel.videoCount} VIDEOS</span>  
                    <span class="seprater"><i class="fas fa-circle"></i></span>  
                    <span class="totalviews">${channel.status}</span>  
                    <span class="seprater"><i class="fas fa-circle"></i></span>  
                    <span class="uploaddate">${channel.visibility == 1 ? 'PUBLIC' : 'PRIVATE'}</span>
                </p>
                <p>
                    <button class="btn btn-danger btn-sm btn-round ml-1" title="Delete Channel" onclick="MyChannels.deleteChannel(${channel.id})"> <i class="fas fa-trash"></i></button>   
                    <button class="btn btn-info btn-sm btn-round" title="Update Channel" onclick="MyChannels.updateChannel(${channel.id})"><i class="fas fa-edit"></i></button>
                </p>
            </div>
        </div>`);
}

let VideoThumbnail= ({video}) => {
    let poster = '/static/assets/images/video-thumbs/2.webp';
    if(video.poster){
        let {baseDir, screenshots } = JSON.parse(video.poster);
        if(baseDir && screenshots && screenshots.length > 0)
            poster = baseDir.concat('/' + screenshots[1]);
    }  
    
    return (`
        <div class="videothumbs">
            <a href="#/video/watch?hash=${video.hash}" class="page-view">
            <div class="thmbsimg" style="background-image:url(${poster});background-size:cover">
                <div class="middle">
                    
                        <div class="text"><i class="fa fa-play" aria-hidden="true"></i></div>
                   
                </div>
            </div>
            </a>
            <div class="sortdetails">
                <div class="channeldp">
                    <img src="${video.channelArt}" alt="">
                </div>
                <h4>${video.name}</h4>
                <p>
                    <span class="creatorname"><a href="#/ti/channel/videos?id=${video.channelId}&name=CHANNEL_VIDEOS" class="page-view">${video.channelName}</a></span>
                    <span class="totalviews">${video.views} Views</span>  
                    <span class="seprater"><i class="fas fa-circle"></i></span>  
                    <span class="uploaddate">${video.createdAt}</span>
                </p>
            </div>
        </div>`);
}

let ChannelThumbnail = ({channel}) => {
    return `
        <div class="channel-thumbs">
            <div class="thmbsimg" style="background-image:url(${channel.channelArt});background-size:cover">
                <div class="chvideocount"><i class="fa fa-indent" aria-hidden="true"></i>${channel.videoCount}</div>
                <div class="middle">
                    <a href="#/ti/channel/videos?id=${channel.id}&name=CHANNEL_VIDEOS" class="page-view">
                        <div class="text"><i class="fa fa-play" aria-hidden="true"></i>View All</div>
                    </a>
                </div>
            </div>
            <div class="sortdetails">
                <div class="channeldp">
                    <img src="${channel.channelArt}" alt="">
                </div>
                <h4>${channel.name}
                </h4>
                <p> <a class="page-view" href="#/ti/user?userId=${channel.userId}"><span class="creatorname capitalize">${channel.firstName} ${channel.lastName}</a></span>
                    <span class="totalviews">${channel.videoCount} Videos</span>  
                    <span class="seprater"><i class="fas fa-circle"></i></span>  
                    <span class="uploaddate">${channel.visibility == 1 ? 'Public' : 'Private'}</span>
                </p>
            </div>
        </div>`
}

let VideoThumbnailHome = ({video}) => {
    let poster = '/static/assets/images/video-thumbs/2.webp';
        if(video.poster){
            let {baseDir, screenshots } = JSON.parse(video.poster);
            if(baseDir && screenshots && screenshots.length > 0)
                poster = baseDir.concat('/' + screenshots[1]);
        }  
        return (`
            <div class="item">
                <div class="videothumbs">
                <a href="#/video/watch?hash=${video.hash}">
                <div class="thmbsimg" style="background-image:url(${poster});background-size:cover">
                    <div class="middle"><div class="text"><i class="fa fa-play"aria-hidden="true"></i></div></div>
                </div>
                </a>
                <div class="sortdetails">
                    <div class="channeldp"><img src="${video.channelArt}" alt=""></div>
                    <h4>${video.name}</h4>
                    <p><span class="creatorname"><a href="#/ti/channel/videos?id=${video.channelId}&name=CHANNEL_VIDEOS" class="page-view">${video.channelName}</a></span>
                    <span class="totalviews">${video.views} Views</span>  <span class="seprater"><i class="fas fa-circle"></i></span>  <span class="uploaddate">${video.createdAt}</span>
                    </p>
                </div>
                </div>
            </div>
        `)
}

let SuggestionVideoThumbnail = ({video}) => {
    let poster = '/static/assets/images/video-thumbs/2.webp';
    if(video.poster){
        let {baseDir, screenshots } = JSON.parse(video.poster);
        if(baseDir && screenshots && screenshots.length > 0)
            poster = baseDir.concat('/' + screenshots[1]);
    }  

    return (`
        <div class="videothumbs">
            <div class="col-sm-5 video-wraps">
                <a href="#/video/watch?hash=${video.hash}" class="page-view">
                <div class="vid-thmbs" style="background-image:url(${poster});background-size:cover">
                    <div class="middle">
                        
                            <div class="text"><i class="fa fa-play" aria-hidden="true"></i></div>
                        
                    </div>
                </div>
                </a>
            </div>
            <div class="col-sm-7 video-details-wraps">
              <div class="sortdetails">
                <div class="channeldp"><img src="${video.channelArt}" alt=""></div>
                <h4>${video.name}</h4>
                <p> 
                    <span class="creatorname"><a href="#/ti/channel/videos?id=${video.channelId}&name=CHANNEL_VIDEOS" >${video.channelName}</a></span>
                    <span class="totalviews">${video.views} Views</span>  
                    <span class="seprater"><i class="fas fa-circle"></i></span>  
                    <span class="uploaddate">${video.createdAt}</span>
                </p>
              </div>
            </div>  
        </div>
        `);
}



// public components

class Search{
    constructor({query, el}){
        this.el = el;
        this.query = query;
    }

    async viewInit(){
        new DataThumbnail({
            countField:'count',
            dataField:'records',
            url:`/api/search?q=${this.query.q}`,
            id:'ti-search-results-data',
            noDataFound : NoDataFound({msg: 'No videos found!'}).html(),
            template : {
                component : (video) => {
                    return VideoThumbnail({video})
                }
            }
        });

        //loadLinks();
    }

    async html(){
        return (`
            <div class="container-fluid">
                ${PageHeading({heading:'SEARCH RESULTS'})}
                <div id="ti-search-results-data">
        
                </div>
            </div>
        `)
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class Home {
    constructor({el, query}){
        this.el = el;
        this.query = query;

        this.init();
    }

    init(){}

    viewInit(){

        //loadLinks();

        let owlProps = {
            items:4,
            nav:true,
            dots:false,
            loop:false,
            autoplay:true,
            autoplayTimeout:4000,
            autoplayHoverPause:true,
            smartSpeed:1000,
            rtl:false,
            singleItem:true,
            margin:0,
            responsive:{
                0:{
                    items:1
                },
                600:{
                    items:3
                },
                1000:{
                    items:4
                }
            }
            }
        
            $('#trending_lists').removeClass('owl-carousel owl-theme');
            $('#trending_lists').html(Loading());
            $('#top_lists').removeClass('owl-carousel owl-theme');
            $('#top_lists').html(Loading());
            $('#latest_lists').removeClass('owl-carousel owl-theme');
            $('#latest_lists').html(Loading());
            

        http().get({url:`/api/video/category?page=1&size=10&name=TRENDING_VIDEOS`}).then( async r => {
            if(r.videos && r.videos.length > 0){
                $('#trending_lists').empty();
                let trendingVideos = r.videos.map(video => VideoThumbnailHome({video})).join('');
                $('#trending_lists').addClass('owl-carousel owl-theme');
                $('#trending_lists').append(trendingVideos);
                $('#trending_lists').owlCarousel(owlProps);
            } else {
                $('#trending_lists').removeClass('owl-carousel owl-theme');
                $('#trending_lists').html(NoDataFound({msg:'No trending videos found!'}).html());
            }
        })

        http().get({url:`/api/video/category?page=1&size=10&name=LATEST_VIDEOS`}).then( async r => {
            if(r.videos && r.videos.length > 0){
                $('#latest_lists').empty();
                let latestVideos = r.videos.map(video => VideoThumbnailHome({video})).join('');
                $('#latest_lists').addClass('owl-carousel owl-theme');
                $('#latest_lists').append(latestVideos);
                $('#latest_lists').owlCarousel(owlProps);
            } else {
                $('#latest_lists').removeClass('owl-carousel owl-theme');
                $('#latest_lists').html(NoDataFound({msg:'No latest videos found!'}).html());
            }
        })

        http().get({url:`/api/video/category?page=1&size=10&name=TOP_VIDEOS`}).then( async r => {
            if(r.videos && r.videos.length > 0){
                $('#top_lists').empty();
                let topVideos = r.videos.map(video => VideoThumbnailHome({video})).join('');
                $('#top_lists').addClass('owl-carousel owl-theme');
                $('#top_lists').append(topVideos);
                $('#top_lists').owlCarousel(owlProps);
            } else {
                $('#top_lists').removeClass('owl-carousel owl-theme');
                $('#top_lists').html(NoDataFound({msg:'No top videos found!'}).html());
            }
        })

        Store.get({key : 'category'}, d => {
            d.map(c => {
                $('#home-sidebar-list').append(`<li><a href="#/video/category?name=${c.name}&id=${c.id}"><i class="${c.fontAwesomeClass}"aria-hidden="true"></i><span>${c.name.toLowerCase()}</span></a></li>`);
            })
        })
    }

    async html(){
        return (`
        <div class="container-fluid">
        <div class="row">
        <div class="col-md-1 d-none d-md-block d-lg-block">
            <nav class="home-sidebar">
                <ul id="home-sidebar-list">
                    <li><a href="#/home"><i class="fa fa-home" aria-hidden="true"></i><span>Home</span></a></li>
                    <li><a href="#/video/category?name=TRENDING_VIDEOS"><i class="fa fa-fire"aria-hidden="true"></i><span>Trending</span></a></li>
                    <li><a href="#/video/category?name=LATEST_VIDEOS"><i class="fa fa-flag"aria-hidden="true"></i><span>Latest Videos</span></a></li>
                    <li><a href="#/video/category?name=TOP_VIDEOS"><i class="fa fa-play-circle"aria-hidden="true"></i><span>Top Videos</span></a></li>
                
                </ul>
            </nav>
        </div>
        <div class="col-md-11 col-lg-11">
            <div class="row">
                <div class="col-md-12">
                    ${PageHeading({back:{show:false}, heading:'TRENDING VIDEOS', next:[
                        {link:'#/video/category?name=TRENDING_VIDEOS', label:'Explore More <i class="fas fa-angle-double-right"></i>'}
                    ]})}
                    <div class="row">
                        <div class="col-md-12">
                            <div id="trending_lists" class="owl-carousel owl-theme">
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    ${PageHeading({back:{show:false}, heading:'TOP VIDEOS', next:[
                        {link:'#/video/category?name=TOP_VIDEOS', label:'Explore More <i class="fas fa-angle-double-right"></i>'}
                    ]})}
                    <div class="row">
                        <div class="col-md-12">
                            <div id="top_lists" class="owl-carousel owl-theme">
                            
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    ${PageHeading({back:{show:false}, heading:'LATEST VIDEOS', next:[
                        {link:'#/video/category?name=LATEST_VIDEOS', label:'Explore More <i class="fas fa-angle-double-right"></i>'}
                    ]})}
                    <div class="row">
                        <div class="col-md-12">
                            <div id="latest_lists" class="owl-carousel owl-theme">
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
        </div>
        `);
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        await this.viewInit();
    }
}

class About {
    constructor({el, query}){
        this.el = el;
        this.query = query;

        this.init();
    }

    init(){}

    viewInit(){}

    async html(){
        return `ABOUT`
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class Contact {
    constructor({el, query}){
        this.el = el;
        this.query = query;
    }

    init(){}

    viewInit(){}

    async html(){
        return `CONTACT`
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class TiUser {

    constructor({el, query}){
        this.el = el;
        this.userId= query.userId;

        this.user = undefined;
        this.init();
    }

    async init(){
            http().get({url:`/api/get/user/${this.userId}`}).then(r => {
                this.user = r.user;
                this.render()
            })
    }

    async viewInit(){
        //loadLinks();
    }

    async html(){
        if(this.user){
           
            return `
            <div class="container-fluid">
            ${PageHeading({ heading: 'USER PROFILE', next:[
                {link:`#/ti/channels?userId=${this.user.id}&username=${this.user.firstName}`,label:'View Channels'}
            ]})}
                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-body">
                            
                                <div class="row">
                                <div class="col-md-4">

                                    <div class="form-group text-center">
                                        <div style="background-image:url('${this.user.avatar}');height:200px;width:200px;background-repeat: no-repeat;
                                        background-size: cover;display:inline-block"></div>                            
                                    </div>
            
                                    <p class="text-center "><a class="btn btn-info btn-sm btn-circle page-view" href="#/ti/channels?userId=${this.user.id}&username=${this.user.firstName}" data-tab="channels"><i class="fas fa-compact-disc"></i> View channels</a></p>
            
                                
                                </div>
                                <div class="col-md-6">
            
                                    <h3>About Us</h3>
                                    <hr/>
                                    <div class="form-group">
                                        <small for="firstName" class="text-muted">Full Name</small>
                                        <p><strong>${this.user.firstName} ${this.user.lastName}</strong></p>
                                    </div>
            
                                    <div class="form-group">
                                        <small for="firstName" class="text-muted">Email/Username</small>
                                        <p><strong>${this.user.email}</strong></p>
                                    </div>
            
                                    <div class="form-group">
                                        <small for="firstName" class="text-muted">About Me</small>
                                        <p><strong>${this.user.bio}</strong></p>
                                    </div>
            
                                    <div class="form-group">
                                        <small for="firstName" class="text-muted">Joined</small>
                                        <p><strong>${this.user.createdAt}</strong></p>
                                    </div>
            
                                    
                                </div>
                                </div>
                            
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        } else 
            return `<div class="container-fluid"><div class="row"><div class="col-sm-12"><p>Loading...</p></div></div></div>`;
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit()
    }
}

class CategoryVideos {
    constructor({query, el}){
        this.query = query;
        this.el = el;
        this.videos = undefined;
        this.currentPage = 1;
        this.size = 5;
        this.count = 0;
        this.categoryName = query['name'];
        console.log(this.query)
    }

    async viewInit(){

        let authVideos = ['SUBSCRIPTION_VIDEOS','YOUR_VIDEOS','WATCH_LATER_VIDEOS'];

        let url = '';
        if(this.query['id'])
            url = `/api/video/category?name=${this.query['name']}&categoryId=${this.query['id']}`;
        else 
            url = `/api/video/category?name=${this.query['name']}`;

        console.log(url)

        new DataThumbnail({
            countField:'count',
            dataField:'videos',
            url:url,
            id:'ti-category-videos-data',
            noDataFound : NoDataFound({msg: 'No videos found!'}).html(),
            template : {
                component : (video) => {
                    return VideoThumbnail({video})
                }
            }
        });

        //loadLinks();
    }

    async html(){
            return (`
            <div class="container-fluid">
                ${PageHeading({heading: `${this.categoryName.replaceAll('_',' ')} COLLECTION`})}
                <div id="ti-category-videos-data">
                </div>
            </div>
            `);
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class TiUserChannels {

    constructor({el, query}){
        this.el = el;
        this.query = query;

        this.init();
    }

    async init(){
        // http().get({url:`/api/get/user/${this.query['userId']}`}).then(r => {
        //     console.log(r)
        // })
    }

    async viewInit(){
        new DataThumbnail({
            countField:'count',
            dataField:'channels',
            url:`/api/get/user/${this.query['userId']}/channels`,
            id:'ti-user-channels-data',
            noDataFound : NoDataFound({msg: 'No channels found!'}).html(),
            template : {
                component : (channel) => {
                    return ChannelThumbnail({channel})
                }
            }
        });

        //loadLinks();
    }

    async html(){
        return (`
            <div class="container-fluid">
                ${PageHeading({heading:`CHANNELS COLLECTION`, subHeading:`<p>By <span class="text-danger">${decodeURI(this.query['username'])}</span></p>`})}
                
                <div id="ti-user-channels-data">
                    
                </div>               
            </div>
        `)
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class TiUserChannelVideos {

    constructor({el, query, channel}){
        this.el = el;
        this.channelId = query['id'];

    }

    async viewInit(){

        http().get({url:`/api/get/channel/${this.channelId}`}).then(r => {
            console.log(r)
            $('#page-heading').html(PageHeading({heading:`${r.channel?.name.toUpperCase()} CHANNEL`, subHeading: `
                <p class="description"><small class="text-muted"><i class="fa fa-caret-right"></i> ${r.channel.description}</small> <br/><small>by <a href="#/ti/user?userId=${r.channel.userId}">${r.channel.firstName} ${r.channel.lastName}</a></small></p>
                
                <p class="small text-muted">
                    <span class="totalviews">${r.channel.videoCount} Videos</span>  
                    <span class="seprater"><i class="fas fa-circle"></i></span>  
                    <span class="uploaddate">${r.channel.visibility == 1 ? 'Public' : 'Private'}</span>
                </p>
                
            `, next:[]}))
        });

        new DataThumbnail({
            countField:'count',
            dataField:'videos',
            url:`/api/get/channel/${this.channelId}/videos`,
            id:'ti-channel-videos-data',
            noDataFound : NoDataFound({msg: 'No channels found!'}).html(),
            template : {
                component : (video) => {
                    return VideoThumbnail({video})
                }
            }
        });

        //loadLinks();
    }

    async html(){
        return (`
                <div class="container-fluid">
                    <div id="page-heading"></div>
                    <div id="ti-channel-videos-data"></div>     
                </div>
            `);
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class VideoStream {

    constructor({query, el}) {
        this.query = query;
        this.el = el;
        this.videoDetails = undefined;
        this.player = undefined;

        this.playedTime = 0;
        this.viewInterval = undefined;
        this.isViewed = false;

        this.init();
    }

    init = async () => {
        
    }

    viewInit = async () => {
        //loadLinks();
        this.videoDetails = await new VVideoDetails({ el: "player-video-details", query: this.query});
        document.getElementById("player-video-details").innerHTML = await this.videoDetails.html();
        document.getElementById("stream-video-suggestions").innerHTML = await new VVideoSuggestions({ el: "stream-video-suggestions", query: this.query}).html();
        let videoEl = document.getElementById('video-tag');
        
        videoEl.addEventListener( "loadedmetadata", function (e) {
            var width = this.videoWidth,
                height = this.videoHeight;
                console.log(Math.floor(width*(9/16)));
                // videoEl.style.height = Math.floor(width*(9/16))+'px';
                
        }, false );

        initializePlayer();

        let viewInterval = undefined;
        
        videoEl.onplay = () => {
            if(!this.isViewed){
                viewInterval = setInterval(() => {
                    if(this.playedTime >= 20){
                        clearInterval(viewInterval);
                        this.isViewed = true;
                        this.markView(this.query.hash);
                    }
                    this.playedTime++;
                },1000)
            }
            
        }

        videoEl.onpause = () =>  {
            if(viewInterval)
            clearInterval(viewInterval);
        }
        
    }

    markView(hash) {
        http().post({ url:'/api/mark/view', data : {videoId : this.videoDetails.video.id}}).then(r => {
            this.videoDetails.updateView(r.view[0].count);
        })
    }

    html = async () => {
        return (`
        <div id="videoplayerpage">
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-8">
                <div class="videoplayer-wrap">
                    <div class="vidplayer">
                            ${ViPlayer({hash: this.query.hash})}
                    </div>

                    <div class="ti-innerdetails mb-2" id="player-video-details">
                        
                    </div>

                </div>
                <!-- videoplayer-wrap ends -->
            </div>
            <div class="col-lg-4">
                <div class="videosugg-thumbs">
                    <div class="suggestionvid">
                        <p>Suggestions</p>
                    </div>
                    <div id="stream-video-suggestions">
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
            `)
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        await this.viewInit();
    }

}

class VVideoDetails {

    constructor({el, query, data}){
        this.el = el;
        this.query = query;

        this.hash = query['hash'];
        this.video = undefined;
        this.isLoggedIn = false;
        this.likeCount = 0;
        this.subscribeCount = 0;
        this.isLiked = false;
        this.isSubscribed = false;
        this.isMarkedWatchLater = false;
        this.viewCount = 0;

        this.init();
    }

    async init(){
        fetch('/api/video/details',{
            method:'POST',
            headers: headers,
            body:JSON.stringify({hash: this.hash})
        }).then(response => response.json()).then(json => {
            this.video = json.data.video;
            this.isLoggedIn = json.data.isLoggedIn;
            this.hash = json.data.video.hash;
            this.likeCount = json.data.likeCount;
            this.subscribeCount = json.data.subscribeCount;
            this.isLiked = json.data.isLiked;
            this.isSubscribed = json.data.isSubscribed;
            this.isMarkedWatchLater = json.data.isMarkedwatchLater;
            this.viewCount = json.data.viewCount;
            this.render();
        } )
        .catch(err => console.log(err));
    }

    async viewInit(){
        document.getElementById('do-like-unlike').addEventListener('click',this.doLikeUnLike);
        document.getElementById('do-subscribe-unsubscribe').addEventListener('click', this.doSubscribeUnSubscribe);
        document.getElementById('mark-as-watch-later').addEventListener('click', this.markAsWatchLater);
    }

     
    doLikeUnLike = (e) => {
        e.preventDefault();
        if(!this.isLoggedIn){
            return window.location = '#/auth/login';
        }
        let url = this.isLiked ? '/api/user/video/unlike' : '/api/user/video/like';
        http().post({url:url, data : {videoHash : this.hash}}).then(r => {
            this.likeCount = r.likeCount;
            this.isLiked = ! this.isLiked;
            this.render();
        });
        return false;
    }

    doSubscribeUnSubscribe = (e) => {
        e.preventDefault();
        if(!this.isLoggedIn){
            return window.location = '#/auth/login';
        }
        let url = this.isSubscribed ? '/api/user/video/unsubscribe' : '/api/user/video/subscribe';
        http().post({url:url, data : {channelId : this.video.Channel.id}}).then(r => {
            this.subscribeCount = r.subscribeCount;
            this.isSubscribed = ! this.isSubscribed;
            this.render();
        });
        return false;
    }

    markAsWatchLater = (e) => {
        e.preventDefault();
        if(!this.isLoggedIn){
            return window.location = '#/auth/login';
        }
        let url = this.isMarkedWatchLater ? '/api/user/video/unmark-watch-later' : '/api/user/video/mark-watch-later';
        http().post({url:url, data : {videoHash : this.hash}}).then(r => {
            this.isMarkedWatchLater = ! this.isMarkedWatchLater;
            this.render();
        });
        return false;
    }

    updateView(count){
        this.viewCount = count;
        this.render();
    }


    async html(){
        if(this.video){
            return `
                        <div class="videotitle">
                            <div class="channeldp"><img
                                    src="${this.video.Channel.channelArt}"
                                    alt=""></div>
                            <h1>${this.video.name}</h1>
                        </div>

                        <div class="videoOptions">
                            <div class="views-upload"> 
                                <span class="totalviews">${this.viewCount} Views</span> 
                                <span class="seprater"><i class="fas fa-circle"></i></span> 
                                <span class="uploaddate">${this.video.createdAt}</span>
                            </div>

                            <div class="vidoption">
                                <ul>
                                    <li>
                                        <a href="javascript:void()" class="btn btn-hover-grey mr-2" title="Watch this video later" id="mark-as-watch-later" >
                                            ${this.isMarkedWatchLater ? '<i class="fas fa-clock"></i>' : '<i class="far fa-clock"></i>'}
                                        </a>
                                    </li>
                                    <li>
                                        <a href="javascript:void()" class="btn btn-hover-grey mr-2" title="Like this video" id="do-like-unlike">
                                            ${this.isLiked ? `<i class="fas fa-thumbs-up"></i> ${this.likeCount}` : `<i class="far fa-thumbs-up"></i> ${this.likeCount}`}
                                        </a>
                                    </li>
                                    <li>
                                        <a href="javascript:void()" class="btn btn-red" title="Subscribe this channel" id="do-subscribe-unsubscribe">
                                            ${this.isSubscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="video-details" style="border-bottom: 1px solid #eee;margin-bottom:20px;padding-bottom:15px;">
                            <h4>
                                <strong class="text-muted"><a href="#/ti/channel/videos?id=${this.video.Channel.id}&name=CHANNEL_VIDEOS">${this.video.Channel.name}</a></strong>
                                <span class="seprater"><i class="fas fa-circle"></i></span>
                                <sapn class="text-muted"><small>${this.subscribeCount} subscribers</small></span>
                            </h4>
                        </div>
                        
                        <div class="video-details">
                            <h4><i class="fas fa-tag"></i> ${this.video.VideoCategory.name}</h4>
                            <p>${this.video.description}</p>
                        </div>
            `
        } else {
            return `<p>Loading...</p>`
        }
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        await this.viewInit();
    }
}

class VVideoSuggestions {

    constructor({el, query}){
        this.el = el;
        this.hash = query['hash'];
        this.currentPage = 1;
        this.pageSize = 5;
        this.videos = undefined;

        this.init();
    }

    async init(){
        //loadLinks();
        fetch(`/api/video/recommendation?hash=${this.hash}&page=1&size=5`,{
            headers : headers
        })
        .then(response => response.json())
        .then(json => {
            this.videos = json.data.videos;
            this.render();
        }).catch(err => console.log(err));
    }

    async viewInit(){
        //loadLinks();
    }

    async html(){
        if(this.videos && this.videos.length > 0){
            let videoList = this.videos.map( video => SuggestionVideoThumbnail({video}));
            return `${videoList.join('')}`; 
        } else if(this.videos && this.videos.length == 0)
            return `<div class="col-sm-12"><p class="text-center text-muted">No suggestions available.</p></div>`;
        else
            return `<div class="col-sm-12"><p class="text-center">Loading...</p></div>`;
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        await this.viewInit();
    }
}

class Login {

    constructor({el}){
        this.el = el;
    }

    async init(){
    }

    async viewInit(){
        loadFormTransition();

        let loginForm = $('#login-form');
        let loginFormBtn = $('#login-form-btn');
        let loginFormRule = formRule.login;

        loginForm.validate(loginFormRule);

        loginFormBtn.on('click',async () => {
            if(loginForm.valid()){
                $('#password').val(md5($('#password').val()))
            http().post({url:'/api/auth/login', form:loginForm, btn:loginFormBtn}).then(r => {
                localStorage.clear();
                localStorage.setItem('auth', JSON.stringify(r));
                loadProfileImage({refresh: true});
                window.location = '/';
                })
            }
        });
    }

    async html(){
        return `
        <div class="container">
            <div class="row">
                <div class="col-md-3">&nbsp;</div>
                <div class="col-md-6">
                <div class="login_register_wrap">
                    <div class="col-md-12">
                    <div class="login_register">
                        <div class="login_register_form">
                            <a href="#" class="page-view"><img class="login_register_logo" src="/static/assets/images/logo.png" alt=""></a>
                            <h3>Login your Account</h3>
                            <form id="login-form" novalidate>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input id="email" name="email" type="email" class="form-control"/>
                            </div>
                            <div class="form-group">
                                <label for="password">Password</label>
                                <input id="password" name="password" type="password" class="form-control"/>
                            </div>
                            <p class="forgotPss"><a href="#/auth/forget/password" class="page-view">Forgot Password?</a></p>
                            <button type="button" class="btnSubmit" id="login-form-btn" data-label='Login'>Login</button>
                            </form>
                        </div>
                        <div class="donthavacc">
                            <p>Don’t you have an account? <a href="#/auth/register" class="page-view">sign up</a></p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                <div class="col-md-3">&nbsp;</div>
            </div>
        </div>
    `
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        await this.viewInit();
    }
}

class SignUpOTP {
    constructor({el, query}){
        this.el = el;
        this.email = query['email'];
        console.log(query)
    }

    async viewInit(){
        loadFormTransition();

        let signUpOtpBtn = $('#signup-otp-form-btn');
        let resendSignUpOtpBtn = $('#resend-signup-otp-btn');

        signUpOtpBtn.on('click', () => {
            let otp = $('#otp').val();
            http().post({url:'/api/verify/sign-up/otp', data:{otp:otp, email: this.email}, btn: signUpOtpBtn}).then(res => {
                mvc.navigate({path:`/auth/login`});
            }).catch(err => {
                console.log(err);
            })
        });

        resendSignUpOtpBtn.on('click', ()=>{
            http().post({url:'/api/resend/sign-up/otp', data:{email: this.email}, btn: signUpOtpBtn}).then(res => {

            }).catch(err => {
                console.log(err);
            })
        })
        
    }

    async html(){
        return (`
            <div class="container">
                <div class="row">
                    <div class="col-md-6 ml-auto mr-auto">
                        <div class="login_register_wrap">
                        
                        <div class="col-md-12">
                        <div class="login_register">

                            <div class="login_register_form pass_rest_form">
                                <img class="login_register_logo" src="assets/images/logo.png" alt="">
                                <h1>Sign Up</h1>
                                <h3>We have sent a sign up OTP on your same email, which you have used to registered with us. Please, enter here to proceed.</h3>

                                <form id="sign-otp-form" novalidate>
                                <div class="form-group margdown">
                                <label for="email">OTP</label>
                                <input id="otp" type="otp" class="form-control" name="otp">
                                </div>
                                <button type="button" class="btnSubmit" id="signup-otp-form-btn" data-label="Submit">Submit</button>
                                </form>

                            </div>

                            <div class="backtologin">
                                <a href="javascript:void()" class="page-view" id="resend-signup-otp-btn" data-label="Resend OTP"> Resend OTP</a>
                            </div>

                        </div>
                        </div>

                    </div>
                    </div>
                </div>
            </div>
        `)
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}
class Register {

    constructor({el}){
        this.el = el;
        this.countries = [];

        this.init();
    }

    async init(){
        Store.get({key : 'stdCode'}, d => {
            this.countries = d.countries;
        })
    }

    async viewInit(){
        loadFormTransition();

        $("#dob").datepicker({ 
            dateFormat: "dd-mm-yy",
            changeMonth: true,
            changeYear: true,
            yearRange: "1930:2051",
            onSelect: function (dateString, txtDate) {
                $("#dob").focusin();
                $("#dob").focusout();
            }
        });
    
        let registerForm = $("#register-from");
        let registerFormBtn = $('#register-from-btn');
    
        let registerFormRule = formRule.registerForm;
        registerForm.validate(registerFormRule);

        registerFormBtn.on('click', (e) => {
            if(registerForm.valid()){
                $('#password').val(md5($('#password').val()));
                $('#cpassword').val(md5($('#cpassword').val()));
                let email = $('#email').val();
                http().post({url:'/api/auth/register', form:registerForm, btn:registerFormBtn}).then(r => {
                    mvc.navigate({path:`/auth/sign-up/otp/validation?email=${email}`});
                });
            }
        })

        $('#show-password').on('click',(e) => {
            if(e.target.checked){
                $('#password').attr('type','text');
                $('#cpassword').attr('type','text');
            } else {
                $('#password').attr('type','password');
                $('#cpassword').attr('type','password');
            }
        })
    }

    async html(){
        return `
        <div class="container">
            <div class="row">
                <div class="col-md-2">&nbsp;</div>
                <div class="col-md-8">
                <div class="login_register_wrap">
                    <div class="col-md-12">
                    <div class="only_register">
                        <div class="login_register_form">
                            <a href="#" class="page-view"><img class="login_register_logo" src="/static/assets/images/logo.png" alt=""></a>
                            <h3>Create your YouTruth Account</h3>
                            <form id="register-from" novalidate>
                            
                            <div class="row">

                                <div class="col-md-6">
                                
                                    <div class="form-group">
                                        <label for="fname">First Name</label>
                                        <input id="fname" type="text" class="form-control" name="fname">
                                    </div>
                                    <div class="form-group">
                                        <label for="email">Email</label>
                                        <input id="email" type="email" class="form-control" name="email">
                                    </div>
                                    <div class="form-group">
                                        <label for="password">Password</label>
                                        <input id="password" type="password" class="form-control" name="password">
                                    </div>
                                    <div class="form-group">
                                        <label for="dob">Date Of Birth</label>
                                        <input id="dob" type="text" class="form-control" name="dob" autocomplete="off">
                                    </div>
                                    
                                
                                </div>
                                <div class="col-md-6">

                                    <div class="form-group">
                                        <label for="lname">Last Name</label>
                                        <input id="lname" type="text" class="form-control" name="lname">
                                    </div>
                                    <div class="form-group">
                                        <label>Gender</label>
                                        <select class="form-control" name="gender">
                                            <option value=""> -- Select Gender -- </option>
                                            <option value="M" >Male</option>
                                            <option value="F">Female</option>
                                            <option value="O">Other</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="cpassword">Confirm Password</label>
                                        <input id="cpassword" type="password" class="form-control" name="cpassword">
                                    </div>
                                    <div class="form-group">
                                        <div class="mobile-wrapper">
                                            <div class="" style="width:40%;float:left;margin: 28px 1px 0 0;" >
                                                <select class="custom-select" name="std">
                                                    ${this.countries.map(c => '<option value="'+ c.code +'">'+ c.code +'</option>').join('')}
                                                </select>
                                            </div>
                                            <div style="width:59%;float:left">
                                                <label for="mobile">Mobile</label>
                                                <input id="mobile" type="text" class="form-control" name="mobile">
                                            </div>
                                        </div>
                                    </div>
                                
                                </div>
                                <div class="col-md-12">
                                    <div class="form-group form-check mt-3">
                                        <input type="checkbox" class="form-check-input" id="show-password">
                                        <span class="form-check-label text-muted">Show password</span>
                                    </div>                                                                            
                                </div>

                                <div class="col-md-12">
                                    <div class="form-group form-check mt-3">
                                        <input type="checkbox" class="form-check-input" id="tnc" name="tnc">
                                        <span class="form-check-label text-muted" for="tnc">By creating an account, you are agree to our terms and condition you're over the age of 13.</span>
                                    </div>                                                                            
                                </div>
                                <button type="button" class="btnSubmit mt-4" id="register-from-btn" data-label="Sign Up">Sign Up</button>
                                
                            </form>
                        </div>
                        <div class="donthavacc">
                            <p>Already have an account? <a href="#/auth/login" class="page-view">login</a></p>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                <div class="col-md-2">&nbsp;</div>
            </div>
        </div>
    `
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class ForgetPassword {

    constructor({el}){
        this.el = el;
    }

    async init(){}

    async viewInit(){
        loadFormTransition();

        let resetform = $('#reset-password-email-form');
        let resetFormBtn = $('#reset-password-email-form-btn');
        let resetFormRule = formRule.resetPasswordEmailForm;
        resetform.validate(resetFormRule);
        resetFormBtn.on('click', () => {
            if(resetform.valid())
                http().post({url:'/api/auth/send/reset/password/link',form:resetform, btn:resetFormBtn});
        })
    }

    async html(){
        return `
        <div class="container">
            <div class="row">
                <div class="col-md-3">&nbsp;</div>
                <div class="col-md-6">

                <div class="login_register_wrap">
                    
                    <div class="col-md-12">
                    <div class="login_register">
                        

                        <div class="login_register_form pass_rest_form">
                            <img class="login_register_logo" src="assets/images/logo.png" alt="">
                            <h1>Reset your Password</h1>
                            <h3>The password reset link will be sent to your registered email address.</h3>

                            <form id="reset-password-email-form" novalidate>
                            <div class="form-group margdown">
                            <label for="email">Email</label>
                            <input id="email" type="email" class="form-control" name="email">
                            </div>
                            <button type="button" class="btnSubmit" id="reset-password-email-form-btn" data-label="Send Email">Send Email</button>
                            </form>

                        </div>

                        <div class="backtologin">
                            <a href="#/auth/login" class="page-view"> Back to Login</a>
                        </div>

                    </div>
                    </div>

                </div>
                </div>
                <div class="col-md-3">&nbsp;</div>
            </div>
            </div>
    `
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class PageNotFound {

    constructor({el}){
        this.el = el;
    }

    async init(){}

    async viewInit(){}

    async html(){
        return (`
            <div class="container-fluid">
                <div class="row">
                    <div class="col-sm-12">
                        <h4 class="text-center">404</h4>
                        <p class="text-center">Page not found!</p>
                    </div>
                </div>            
            </div>
        `);
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}


// user components

class UserProfile {

    constructor({query, el}){
        this.query = query;
        this.user = undefined;
        this.el = el;

        this.init();
    }

    init = () => {
        this.profile();
    }

    viewInit = () => {
        //loadLinks();
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

    profile = () => {
        http().get({url:'/api/account/user/profile'})
        .then(data => {
            this.user = data.user;
            this.render();
        }).catch(err => console.log(err))
    }

    html = async () => {
        if(this.user)
            return (`
            <div class="container-fluid">
                ${PageHeading({heading: 'MY PROFILE', next: [{link:'#/account/profile/settings', label:'<i class="fas fa-edit"></i> Profile Settings'}]})}
                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row gutters-sm ">
                                    <div class="col-md-4 mb-3">
                                        <div class="d-flex flex-column align-items-center text-center">
                                            <img src="${this.user.avatar}" alt="Admin" class="rounded-circle" style="height:200px;width:200px;">
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
                                            <li class="mb-1"><i class="fas fa-mobile"></i> Call me <span class="text-secondary">${this.user.std? this.user.std+'-' : ''}${this.user.mobile?this.user.mobile:'Not Available'}</span></li>
                                            <li class="mb-1"><i class="fas fa-venus-mars"></i> I'm <span class="text-secondary" >${this.gender()}</span></li>
                                            <li class="mb-1"> <i class="fas fa-info-circle"></i> About me </li>
                                            <li class="border-left border-info p-2 mt-2">
                                                <span class="text-secondary" id="userBio">${this.user.bio ? this.user.bio : 'N.A'}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `);
        else 
            return Loading();
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class UserProfileSettings {

    constructor({query, el}){
        this.query = query;
        this.user = undefined;
        this.el = el;

        this.init();
    }

    init = () => {
        this.profile();
    }

    viewInit = () => {
        loadFormTransition();
        //loadLinks();
        
        let img = undefined;
        let file = undefined;

        $('#change-avatar').on('change', (e) => {
            file = e.target.files[0];
            getBase64(e.target.files[0], (b64) => {
                img = b64;
                $("#avatar").attr('src', b64);
            })
        });
        
        let form1 = $('#update-bio-form');
        let form1Btn = $("#update-bio-btn");
        let rule1 = formRule.updateBioForm;

        form1.validate(rule1);
        form1Btn.on('click', e => {
            let data = {};
            if(img && file){
                data.mime = file.name.split('.')[1];
                data.size = file.size;
                data.img = img;
            }
            if($("#bio").val() && $("#bio").val().trim() != '')
                data.bio = $("#bio").val();

            if(form1.valid() && Object.keys(data).length > 0){
                http().post({url:'/api/account/update/bio-avatar', data : data, btn: form1Btn})
                .then(r => {
                    loadProfileImage({refresh: true});
                })
            }
        })

        $("#dob").datepicker({ 
            dateFormat: "dd-mm-yy",
            changeMonth: true,
            changeYear: true });

        let form2 = $("#update-profile-form");
        let rule2 = formRule.updateProfileForm;
        
        form2.validate(rule2);
        $("#update-profile-btn").on('click', e => {
            if(form2.valid()){
                http().post({url:'/api/account/update/profile', form: form2, btn: $("#update-profile-btn")})
                    .then(r => {
                        this.user = r.data.user;
                        this.render();
                    })
            }
        })
    }


    profile = () => {
        fetch('/api/account/user/profile',{
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
            ${PageHeading({heading:'PROFILE SETTINGS', next:[{link: '#/account/profile', label:'<i class="fas fa-user"></i> Profile'}]})}
                
                <div class="row">
                    <div class="col-sm-6 mb-2">
                        <div id="public-info">
                            <form class="card" id="update-bio-form">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="text-center">
                                                <img alt="Chris Wood" src="${this.user.avatar}"
                                                    class="rounded-circle img-responsive mt-2" style="width: 128px; height:128px;" id="avatar">
                                                <div class="mt-2">

                                                <div class="file-input-wrapper btn-dark">
                                                    <i class="fas fa-camera"></i> <span class="ml-1"> Avatar</span>
                                                    <input type="file" id="change-avatar" class="form-input">
                                                </div>
                                                </div>
                                                <p class="text-muted"><i class="fas fa-info-circle"></i><small>For best results, use an image at least 128px by 128px in .jpg format</small></p>
                                            </div>
                                            <div class="form-group">
                                                <label for="username" >Username/Email</label>
                                                <input id="username" type="text" class="form-control" disabled value="${this.user.email}">
                                            </div>
                                            <div class="form-group">
                                                <label for="bio" >Biography</label>
                                                <textarea rows="2" id="bio" name="bio" class="form-control">${this.user.bio ? this.user.bio : '' }</textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="btn maincta-btn mt-2" type="button" id="update-bio-btn" data-label="Save changes">Save changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="tab-pane active" id="user-account" role="tabpanel">
                            <form class="card" id="update-profile-form">
                                <div class="card-body">
                                    <div class="form-row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="firstName" class="">Firstname</label>
                                                <input name="firstName" id="firstName" type="text" class="form-control" value="${this.user.firstName}"></div>
                                            </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="lastName" class="">Lastname</label>
                                                <input name="lastName" id="lastName" type="text" class="form-control" value="${this.user.lastName}">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="firstName" class="">Gender</label>
                                                <select  id="gender" class="form-control" disabled>
                                                    <option value=""></option>
                                                    <option value="M" ${this.user.gender == 'M' ? 'selected' : null}>Male</option>
                                                    <option value="F" ${this.user.gender == 'F' ? 'selected' : null}>Female</option>
                                                    <option value="O" ${this.user.gender == 'O' ? 'selected' : null}>Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="dob">Date Of Birth</label>
                                            <input disabled type="text" class="form-control" value="${this.user.dob}">
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="mobile">Mobile</label>
                                            <input disabled type="text" class="form-control" value="${this.user.std? this.user.std+'-' : ''}${this.user.mobile?this.user.mobile:'Not Available'}">
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label for="email">Email</label>
                                            <input disabled="disabled" id="email" type="email" class="form-control" value="${this.user.email}">
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label for="address">Address</label>
                                            <textarea name="address" id="address" rows="3" class="form-control">${this.user.address ? this.user.address : ''}</textarea>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="btn maincta-btn mt-2" id="update-profile-btn" data-label="Save changes">Save changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;
        } else {
            return Loading();
        }
    }

    render = async () => {
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class MyChannels {

    constructor({el}){
        this.el = el;

        this.init();
    }

    async init(){}

    static deleteChannel(channelId){
        http().post({url:'/api/user/delete/channel', data : {channelId}}).then(r => {
            mvc.navigate({path:'/user/channels'});
        })
    }

    static async updateChannel(channelId){
        $('#update-channel-modal h5').html('UPDATE CHANNEL DETAILS');
        $('#update-channel-modal').modal('show');
        await new UpdateChannel({el:'update-channel-form-wrapper', channelId, modalEl: "#update-channel-modal"}).render();
    }

    async viewInit(){
        //loadLinks();

        new DataThumbnail({
            countField:'count',
            dataField:'channels',
            url:`/api/user/get/channels`,
            id:'my-channels-data',
            noDataFound : `<div class="">
                                ${NoDataFound({msg: 'No channels found!'}).html()}
                                <p class="text-center pt-4"><a href="#/user/channel/create" class="btn btn-hover-red btn-lg page-view"><i class="fas fa-plus-circle"></i> Create Channel</a></p>
                            </div>`,
            template : {
                component : (channel) => {
                    return MyChannelThumbnail({channel})
                }
            }
        })

    }

    async html(){

        return (`
            <div class="container-fluid">
                ${PageHeading({heading:'MY CHANNELS', next:[
                    {link:'#/user/channel/create', label:'<i class="fas fa-plus-circle"></i> Create Channel'}
                ]})}

                <div id="my-channels-data">
                
                </div>
            </div>  

            <div class="modal fade" id="update-channel-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" >Modal title</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body" id="update-channel-form-wrapper">
            
                        </div>
                    </div>
                </div>
            </div>
        `)
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class MyChannelVideos {

    constructor({el, query}){
        this.el = el;
        this.channelId = query['id'];
        this.channel = undefined;

        this.init();
    }


    async init(){
            http().get({url:`/api/user/get/channel/${this.channelId}`}).then(r => {
                this.channel = r.channel;
                this.render();
            })
    }

    static playVideoInPopUp(hash, videoTitle){
        $('#bs-modal-wrapper').html(modal({body: ViPlayer({hash}), heading: `<i class="fas fa-play-circle"></i> ${videoTitle}`, id:'popup-video-player'}))
        $('#popup-video-player').modal('show');
        let vjs = initializePlayer();
        vjs.play();
        $('#close-modal').on('click', (e) => {
            vjs.pause();
            $('#popup-video-player').modal('hide');
           return true;
        })
    }

    static deleteVideo(hash, channelId){
        http().post({url:'/api/user/delete/video', data:{hash}}).then(r => {
            mvc.navigate({path:`/user/channel/videos?id=${channelId}&name=CHANNEL_VIDEOS`})
        })
    }

    static async updateVideo(hash, channelId){
        $('#update-video-modal h5').html('UPDATE VIDEO DETAILS');
        $('#update-video-modal').modal('show');
        await new UpdateVideo({el:'update-video-form-wrapper', hash, modalEl: "#update-video-modal"}).render();
    }

    static async uploadVideo({id, name}){
        $('#update-video-modal h5').html('UPLOAD VIDEO');
        $('#update-video-modal').modal('show');
        await new UploadVideo({el:'update-video-form-wrapper', channel:{id, name}, modalEl: "#update-video-modal"}).render();
    }
    async viewInit(){
        //loadLinks();
        
        let videosThumbnail = new DataThumbnail({
            countField:'count',
            dataField:'videos',
            url:`/api/user/get/channel/${this.channelId}/videos`,
            id:'my-channel-videos-data',
            noDataFound : `<div class="">
                                ${NoDataFound({msg: 'No video found!'}).html()}
                                <p class="text-center pt-4"><a href="javascript:MyChannelVideos.uploadVideo({id: ${this.channelId}, name: '${this.channelName}'})" class="btn btn-hover-red btn-lg"><i class="fas fa-plus-circle"></i> Upload Video</a></p>
                            </div>`,
            template : {
                component : (video) => {
                    return MyVideoThumbnail({video})
                }
            }
        })
    }

    async html(){

        return (`
            <div class="container-fluid">

                ${this.channel ? PageHeading({ 
                    heading: `${this.channel?.name.toUpperCase()}`, 
                    subHeading: `
                        <p class="description"><small class="text-muted"><i class="fa fa-caret-right"></i> ${this.channel?.description}</small> <br/><small>by <a href="#/ti/user?userId=${this.channel?.userId}">${this.channel?.firstName} ${this.channel?.lastName}</a></small></p>
        
                        <p class="small text-muted">
                            <span class="totalviews">${this.channel?.videoCount} Videos</span>  
                            <span class="seprater"><i class="fas fa-circle"></i></span>  
                            <span class="uploaddate">${this.channel?.visibility == 1 ? 'Public' : 'Private'}</span>
                            <span class="seprater"><i class="fas fa-circle"></i></span>  
                            <span class="uploaddate">${this.channel?.status}</span>
                        </p>
                    `, 
                    next:[
                        {link:`javascript:MyChannelVideos.uploadVideo({id: ${this.channelId}, name: '${this.channel.name}'})`, label: '<i class="fas fa-arrow-alt-circle-up"></i> Upload Video' },
                        {link:'#/user/channels', label: '<i class="fas fa-compact-disc"></i> My Channels' }
                    ]
                }): PageHeading({heading:'Channel Videos',next:[
                    {link:'#/user/channels', label: 'My Channels' }
                ]})}
                
                <div id="my-channel-videos-data">

                </div>

            </div>

            <div class="modal fade" id="update-video-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" >Modal title</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body" id="update-video-form-wrapper">
                
                        </div>
                    </div>
                </div>
            </div>
        `)
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class CreateChannel {

    constructor({el}){
        this.el = el;
        this.createNew = false;
    }

    async init(){}

    async viewInit(){

        loadFormTransition();

        let channelArtAttachment = new Attachment({
            el:'channel-art-attachment',
            note:'Attach an image(png/jpeg/jpg) for channel cover (maximum 1mb size is allowed)',
            name:'channelArt',
            id:'channelArt',
            label:'Attach Cover',
            // type: 'image/x-png,image/gif,image/jpeg',
            size: 1024*1024,
            icon: 'fas fa-image'
        });

        await channelArtAttachment.render();

        let createChannelForm = $('#create-channel');
        let createChannelBtn = $('#create-channel-btn');
        let createChannelRule = formRule.createChannel;
        createChannelForm.validate(createChannelRule);

        createChannelBtn.on('click', (e) => {
            if(createChannelForm.valid()){
                let data = {};
                let file = channelArtAttachment.file;
                createChannelForm.serializeArray().map(ob => data[ob.name]=ob.value);
                getBase64(file , (base64) => {
                    data['channelArt'] = base64;
                    data['mime'] = file.name.split('.')[1];
                    data['size'] = file.size;
                    http().post({url:'/api/user/post/channel',data: data, btn:createChannelBtn}).then(r => {
                        mvc.navigate({path:`/user/channel/videos?id=${r.channel.id}&name=CHANNEL_VIDEOS`});
                    })
                })
            }
        })
    }


    async html(){
        return `
        <div class="container-fluid">
            
            ${PageHeading({heading:'CREATE CHANNEL', next:[
                {link:'#/user/channels', label:'<i class="fas fa-compact-disc"></i> My Channels'}
            ]})}

            <div class="row">
                <div class="col-sm-12">
                    <div class="card">
                        <div class="card-body">
                            <form novalidate id="create-channel">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="name">Channel Name</label>
                                            <input type="text" class="form-control" name="name" id="name" />
                                        </div>
                                        <div class="form-group mb-3">
                                        <label for="description">Privacy </label>
                                            <select class="custom-select" id="visibility" name="visibility">
                                                <option selected value=""> -- Select Privacy -- </option>
                                                <option value="1" >Public</option>
                                                <option value="0">Private</option>
                                            </select>
                                        </div>

                                        <div id="channel-art-attachment"></div>

                                       

                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="description"> Channel Description </label>
                                            <textarea class="form-control" rows="5" name="description" id="description"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-12">
                                        <center>
                                            <button type="button" class="btn maincta-btn" id="create-channel-btn" data-label='Create Channel'>Create Channel</button>
                                        </center>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>    
        </div>
    `;
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class UpdateChannel {

    constructor({el, modalEl, channelId}){
        this.el = el;
        this.modalEl = modalEl;
        this.channelId = channelId;  
        this.channel = undefined;

        this.init();
    }

    async init(){
        http().get({url:`/api/user/get/channel/${this.channelId}`}).then(r => {
            this.channel = r.channel;
            this.render();
        })
    }

    async viewInit(){

        let self = this;
        loadFormTransition();
        let updateChannelForm = $('#update-channel');
        let updateChannelBtn = $('#update-channel-btn');
        let updateChannelRule = formRule.updateChannel;
        updateChannelForm.validate(updateChannelRule);
        updateChannelBtn.on('click', (e) => {
            http().post({url:'/api/user/update/channel',form: updateChannelForm, btn:updateChannelBtn}).then(r => {
                $(self.modalEl).modal('hide');
                mvc.navigate({path:'/user/channels'})
            })
        })

        
    }


    async html(){
        if(this.channel)
        return `
        <div class="container-fluid">
            <div class="row">
                <div class="col-sm-12">
                    <div class="card">
                        <div class="card-body">
                        <form novalidate id="update-channel">
                            <div class="row">
                                <div class="col-md-6">
                                    
                                        <div class="form-group">
                                            <label for="name">Channel Name</label>
                                            <input type="text" class="form-control" name="name" id="name" value="${this.channel.name}"/>
                                        </div>
                        
                                        <div class="form-group mb-3">
                                        <label for="description">Privacy </label>
                                            <select class="custom-select" id="visibility" name="visibility">
                                                <option selected value=""> -- Select Privacy -- </option>
                                                <option value="1" ${this.channel.visibility == 1 ? 'selected' : ''}>Public</option>
                                                <option value="0"  ${this.channel.visibility == 0 ? 'selected' : ''}>Private</option>
                                            </select>
                                        </div>
                                    
                                </div>
                                <div class="col-md-6">

                                    <div class="form-group">
                                        <label for="description"> Channel Description </label>
                                        <textarea class="form-control" rows="5" name="description" id="description"> ${this.channel.description}</textarea>
                                    </div>
                                    <input type="hidden" class="form-control" name="channelId" id="channelId" value="${this.channelId}" />
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm-12">
                                    <center>
                                    
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                    <button type="button" class="btn maincta-btn" id="update-channel-btn" data-label='UPDATE'>UPDATE
                                    </button>
                                    </center>
                                </div>
                            </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>    
        </div>
    `;
    else 
        return (`
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-12">
                        Loading...
                    </div>
                </div>
            </div>
        `);
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class Attachment {
    constructor({el, note, label, name, id, size = undefined, type = undefined, icon = 'fas fa-video' }){
        this.el = el;
        this.id = id || 'attach-file';
        this.label = label || 'Attach File';
        this.size = size;
        this.name = name || 'attach-file';
        this.note = note;
        this.file = undefined;
        this.type = type;
        this.icon = icon;
    }

    async viewInit(){
        let that = this;
        $(`#${this.id}`).on('change', (e) => {
            that.file = e.target.files[0];
            $(`#attachments-details-${this.id}`).html(`
                <div class="file-wrapper">
                    <span class="file-icon"><i class="${this.icon}"></i></span>
                    <span class="file-name cursor-pointer" title="${this.file.name}">${this.file.name.length > 30 ? `${this.file.name.substr(0,30)}...`: this.file.name}</span>
                    <span class="file-delete cursor-pointer m-1" id="remove-attachment-${this.id}" title="delete file"><i class="fas fa-trash"></i></span>
                    <br/>
                    <span class="file-size"> ${(this.file.size/(1024)).toFixed(2)} KB </span>
                </div>
            `)

            $(`#remove-attachment-${this.id}`).on('click', () => {
                $(`#${this.id}`).val('');
                this.file = undefined;
                $(`#attachments-details-${this.id}`).html(``);
            })
        })

        
    }

    getChunk(){
        let that = this;
        let reader = new FileReader();
        return new Promise( (resolve, reject) => {
            reader.onload = ()=>{
                resolve(reader.result);
            }
            if(that.file)
                reader.readAsDataURL(that.file);
            else {
                reject('File is not attached')
            }
        })
        
    }


    async html(){
        return (`
        <div class="form-group">
            <div class="attachment-input">
                <div class="file-input-wrapper btn-dark">
                    <i class="${this.icon}"></i> <span class="ml-1"> ${this.label} </span>
                    <input type="file" id="${this.id}" name="${this.name}" class="form-input" ${this.type ? `accept="${this.type}"` : ``}>
                </div>
                ${this.note ? `<p class="text-muted">
                <i class="fas fa-info-circle"></i> 
                <small> ${this.note} </small>
            </p>`:``}
            </div>

            <div class="attachments-details" id="attachments-details-${this.id}">
                
            </div>
        </div>
        `);
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class UploadVideo {

    constructor({el, channel, modalEl}){
        this.el = el;
        this.channel = channel;
        this.modalEl = modalEl;
    }

    async init(){}

    async viewInit(){
        //loadLinks();
        loadFormTransition();

        let videoAttachment = new Attachment({
            el:'video-attachment',
            note:'Attach a video to upload (maximum 200mb size is allowed).',
            name:'videoFile',
            id:'videoFile',
            label:'Attach Video',
            type: 'video/*',
            size: 200*1024*1024,
        });

        let videoCoverAttachment = new Attachment({
            el:'video-cover-attachment',
            note:'Attach a video png/jpeg/jpg thumbnail (maximum 1mb size is allowed).',
            name:'videoCover',
            id:'videoCover',
            label:'Attach Video Thumbnail',
            type: 'image/png,image/jpg,image/jpeg',
            icon: 'fas fa-image',
            size: 1024*1024,
        });

        await videoAttachment.render();

        await videoCoverAttachment.render();

        let that = this;
        let channelList = $('#channelId');
        let categoryList = $('#categoryId');

        http().get({url:'/api/user/get/channels-name/list'}).then(r => {
            if(r.channels && r.channels.length > 0){
                r.channels.map(c => {
                    let option = document.createElement('option');
                    option.value = c.id;
                    option.innerHTML = c.name;
                    channelList.append(option)
                })
            }
        })

        Store.get({key:'category'}, d => d.map(c => categoryList.append(`<option value="${c.id}">${c.name}</option>`)));

        
        let videoUploadForm = $('#upload-video-form')
        // let videoFile = $("#videoFile");
        let uploadBtn = $('#upload-video-btn');
        let videoUploadRule = formRule.uploadVideo;
        let file = undefined;

        // videoFile.change(function(e){
        //     file = e.target.files[0];
        // })

        videoUploadForm.validate(videoUploadRule);

        uploadBtn.on('click', async(e) => {
            
            if(videoUploadForm.valid()){
                file = videoAttachment.file;
                let data = {size: file.size, type: file.type, name: file.name};
                if(videoCoverAttachment.file){
                    let chunk = await videoCoverAttachment.getChunk();
                    data['videoThumbnail'] = {
                        size:videoCoverAttachment.file.size, type:videoCoverAttachment.file.type, name:videoCoverAttachment.file.name, chunk
                    }
                }
                videoUploadForm.serializeArray().map(ob => {
                    data[ob.name] = ob.value;
                })
                http().post({url:'/api/user/post/video', data:data, btn: uploadBtn})
                    .then(r => {
                        loading.btn(uploadBtn);
                        uploadChunk({uri:'/api/user/post/file/upload', file:file, hash : r.hash, el: '#progressbar'}, function (result) {
                            loading.btn(uploadBtn);
                            if($(that.modalEl))
                                $(that.modalEl).modal('hide');
                            videoUploadForm.trigger("reset");
                            $('#message-box').html(`
                                <div class="alert alert-success alert-dismissible fade show" role="alert">
                                    <strong>SUCCESS! </strong> Video "<strong>${file.name}</strong>" uploaded successfully.
                                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                            `)
                            mvc.navigate({path:`/user/channel/videos?id=${data.channelId}&name=CHANNEL_VIDEOS`})
                        })
                    })
            }
        })
    }

    async html(){
        return `
        <div class="container-fluid">
            ${ !this.channel ? PageHeading({heading:'UPLOAD VIDEO', next: [
                { link:'#/user/channels', label:'<i class="fas fa-compact-disc"></i> My Channels'}
            ]}): ``}

            <div class="row">
                <div class="col-sm-12">
                    <div class="card">
                        <div class="card-body">
                        <div id="message-box"></div>
                        <form novalidate id="upload-video-form">
                            <div class="row">
                            
                                <div class="col-sm-6">
                                    
                                        ${this.channel ? 
                                          `<input type="hidden" class="form-control" name="channelId" id="channelId" value="${this.channel.id}" />`
                                        : `<div class="form-group">
                                            <label for="channelId"> Channel Name</label>
                                            <select name="channelId" id="channelId" class="custom-select">
                                                <option value="" selected> -- Select Channel -- </option>
                                            </select>
                                        </div>
                                        `}
                                        <div class="form-group">
                                            <label for="videoTitle">Title</label>
                                            <input type="text" class="form-control" name="videoTitle" id="videoTitle" />
                                        </div>
                                        <div class="form-group mb-3">
                                            <label for="categoryId">Category</label>
                                            <select name="categoryId" id="categoryId" class="custom-select">
                                                <option selected value=""> -- Select Category -- </option>
                                            </select>
                                        </div>
                                        

                                        
                                        <div id="video-cover-attachment"></div>
                                        
                                </div>
                                <div class="col-md-6">
                                
                                <div class="form-group">
                                        <label for="channelId"> Privacy</label>
                                        <select class="custom-select" id="visibility" name="visibility">
                                            <option value=""> -- Select Privacy -- </option>
                                            <option value="1">Public</option>
                                            <option value="0">Private</option>
                                        </select>
                                        </div>

                                    <div class="form-group mb-3">
                                        <label for="videoDescription">Description </label>
                                        <textarea class="form-control" rows="2" name="videoDescription"
                                            id="videoDescription"></textarea>
                                    </div>
                                    <div id="video-attachment"></div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm-12">
                                <div id="progressbar"></div>
                                <br/><br/>
                                    <center><button type="button" class="btn maincta-btn" id="upload-video-btn" data-label="UPLOAD"> UPLOAD </button></center>
                                    
                                </div>
                            </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>         
        </div>
    `
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class UpdateVideo {

    constructor({el, hash, modalEl}){
        this.el = el;
        this.hash = hash;
        this.modalEl = modalEl;
        this.video = undefined;

        this.init();
    }

    async init(){
        http().post({url:'/api/video/basic-details', data:{hash: this.hash}}).then(async r => {
            this.video = r.video;
            await this.render();
            this.drawSelect();
        });
    }

    async viewInit(){
        //loadLinks();
        let self = this;
        loadFormTransition();

        let videoUpdateForm = $('#update-video-form')
        let updateBtn = $('#update-video-btn');

        let videoUpdateRule = formRule.updateVideo;

        videoUpdateForm.validate(videoUpdateRule);

        updateBtn.on('click', (e) => {
            if(videoUpdateForm.valid()){
                http().post({url:'/api/user/update/video', form:videoUpdateForm, updateBtn})
                    .then(r => {
                        $(self.modalEl).modal('hide');
                        mvc.navigate({path:`/user/channel/videos?id=${this.video.Channel.id}&name=CHANNEL_VIDEOS`});
                    })
            }
        })
    }

    drawSelect(){
        let channelList = $('#channelId');
        let categoryList = $('#categoryId');

        http().get({url:'/api/user/get/channels-name/list'}).then(r => {
            if(r.channels && r.channels.length > 0){
                r.channels.map(c => channelList.append(`<option value="${c.id}" ${c.id == this.video.Channel.id ? 'selected':''}>${c.name}</option>`))
            }
        })

        Store.get({key:'category'}, d => d.map(c => categoryList.append(`<option value="${c.id}" ${c.id == this.video.categoryId ? 'selected':''}>${c.name}</option>`)));

    }

    async html(){
        if(this.video)
        return `
        <div class="container-fluid">
       
            <div class="row">
                <div class="col-sm-12">
                    <div class="card">
                        <div class="card-body">
                        <div id="message-box"></div>
                        <form novalidate id="update-video-form">
                            <div class="row">
                            
                                <div class="col-sm-6">
                                    
                                        <div class="form-group">
                                            <label for="channelId"> Channel Name</label>
                                            <select name="channelId" id="channelId" class="custom-select">
                                                <option value="" selected> -- Select Channel -- </option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="videoTitle">Title</label>
                                            <input type="text" class="form-control" name="videoTitle" id="videoTitle" value="${this.video.name}" />
                                        </div>
                                        <div class="form-group">
                                            <label for="categoryId">Category</label>
                                            <select name="categoryId" id="categoryId" class="custom-select">
                                                <option selected value=""> -- Select Category -- </option>
                                            </select>
                                        </div>
                                        
                                        <input type="hidden" class="form-control" name="hash" id="hash" value="${this.hash}" />
                                        
                                </div>
                                <div class="col-md-6">
                                
                                <div class="form-group">
                                <label for="channelId"> Privacy</label>
                                <select class="custom-select" id="visibility" name="visibility">
                                    <option value=""> -- Select Privacy -- </option>
                                    <option value="1" ${this.video.visibility == 1 ? 'selected' : ''}>Public</option>
                                    <option value="0" ${this.video.visibility == 0 ? 'selected' : ''}>Private</option>
                                </select>
                                </div>

                                    <div class="form-group">
                                        <label for="videoDescription">Description </label>
                                        <textarea class="form-control" rows="3" name="videoDescription"
                                            id="videoDescription">${this.video.description}</textarea>
                                    </div>


                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm-12">
                                <br/><br/>
                                    <center>
                                    <button type="button" class="btn maincta-btn" id="update-video-btn" data-label="UPDATE"> UPDATE </button>
                                    </center>
                                    
                                </div>
                            </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>         
        </div>
    `
    else 
        return (`
        <div class="container-fluid">
            <div class="row">
                <div class="col-sm-12">
                    Loading...
                </div>
            </div>
        </div>
        `)
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class UpdatePassword {

    constructor({el}){
        this.el = el;
        this.page1 = true; 
    }

    async init(){}

    async viewInit(){
        loadFormTransition();

        let props = formRule.profileUpdatePassword;
        let form = $('#update-profile-password-form');
        let submitBtn = $('#update-profile-password-form-btn');
        let otpBtn = $('#send-otp-btn');

        let resendOtpBtn = $('#resend-otp-btn');

        form.validate(props);

        otpBtn.on('click', () => {
            if (form.valid()) {
                http().post({ url: '/api/account/password/update/otp', btn: otpBtn, time: 30000 });
                $('#up-part-2').css('display','block');
                otpBtn.css('display','none');
            }
        })

        resendOtpBtn.on('click', () => {
            http().post({ url: '/api/account/password/update/otp', btn: otpBtn, time: 30000 })
        })

        submitBtn.on('click', (e) => {
            form.validate(props);
            if (form.valid()) {
                let data = {
                    opassword:md5($('#opassword').val()),
                    npassword:md5($('#npassword').val()),
                    cpassword:md5($('#cpassword').val()),
                    otp:$('#otp').val()
                }
                http().post({ url: '/api/account/password/update', data: data, btn: submitBtn }).then(res => {
                    $('#up-part-1').css('display','none');
                    $('#up-part-2').css('display','none');
                    $('#up-part-3').css('display','block');
                }).catch(err => {

                });
            }
        })

        $('#back-to-up-part-1').on('click', this.togglePage);
        
    }

    togglePage(){
        if(this.page1){
            $('#up-part-1').css('display','none');
            $('#up-part-2').css('display','block'); 
        } else {
            $('#up-part-1').css('display','block');
            $('#up-part-2').css('display','none');
        }
        this.page1 = !this.page1;
    }

    async html(){
        return `
        <div class="container-fluid">

        ${PageHeading({heading:'UPDATE PASSWORD'})}
            <div class="row">
                <div class="col-sm-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-5 mr-auto ml-auto">
                                        

                                        <form novalidate id="update-profile-password-form">

                                            <div id="up-part-1">

                                            <p class="alert alert-warning"> <i class="fas fa-exclamation-circle"></i> In order to <strong>protect your account</strong>, make sure your password contains 
                                                    atleast 1 uppercase, 
                                                    1 lowercase, 
                                                    1 numeric,
                                                    1 special character, and
                                                    length should be atleast 8 characters.</p>

                                            <div class="form-group">
                                                <label for="opasswor">Current Password</label>
                                                <input type="password" name="opassword" id="opassword" class="form-control" />
                                            </div>
                                            <div class="form-group">
                                                <label for="password">New Password</label>
                                                <input type="password" name="npassword" id="npassword" class="form-control" />
                                            </div>
                                            <div class="form-group">
                                                <label for="cpassword">Confirm Password</label>
                                                <input type="password" name="cpassword" id="cpassword" class="form-control" />
                                            </div>
                                            
                                            <center><button type="button" class="btn maincta-btn mt-4 btn-block mb-4" id="send-otp-btn" data-label='Submit'>Submit</button></center>
                                            </div>

                                            <div id="up-part-2" style="display:none">

                                                <p class="alert alert-info mt-4"><i class="fas fa-exclamation-circle"></i> We have sent an OTP to your YouTruth registered email id. Please enter that OTP here...</p>
                                                <div class="form-group">
                                                    <label for="otp">OTP</label>
                                                    <input type="text" name="otp" id="otp" class="form-control" />
                                                </div>
                                                <div class="action-btn-container mt-2 mb-4">
                                                    <button type="button" class="btn defaultcta-btn mt-2" id="resend-otp-btn"> Resend OTP</button>
                                                    <button type="button" class="btn maincta-btn mt-2" id="update-profile-password-form-btn" data-label='Update'>Update</button>
                                                </div>
                                                <hr/>
                                                <p class="text-center mt-4"> <a href="javascript:void()" id="back-to-up-part-1" class="text-dark"><i class="fas fa-arrow-circle-left"></i> Previous Page</a></p>
                                            </div>

                                            <div id="up-part-3" style="display:none">
                                                <p class="alert alert-success text-center mb-4"> Your account password has been changed successfully...</p>
                                                <hr/>
                                                <p class="text-center mt-4"> <a href="#/home" id="back-to-up-part-1" class="text-dark"><i class="fas fa-arrow-circle-left"></i> home </a></p>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    
                </div>
            </div>
        </div>
    `
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class Logout {

    constructor({el}){
        this.el = el;

        this.init();
    }

    async init(){
        http().post({url:'/api/account/logout'}).then(r => {
            localStorage.clear();
            localStorage.setItem('auth', JSON.stringify(r));
            // loadProfileImage({refresh: true});
            window.location = "/";
        }).catch(err => {
            window.location = "/";
        })
    }

    async viewInit(){
        //loadLinks();
    }

    async html(){
        return (`
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-12">
                    <h2 class="display-4"><center>Logged Out Successfully</center></h2>
                    <p><center>You have successfully logged out! <a href = '#/home' >Return Home</a></center></p>
                    </div>
                </div>
            </div>
        `)
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit()
    }
}

// admin components

class AllUsers {

    userTable = undefined;
    
    constructor({el}){
        this.el = el;
        this.currentPage = 1;
        this.size = 5;
        
        this.init();
    }
    
    async init(){}

    async viewInit(){
        //loadLinks();

        AllUsers.userTable = new DataTable({
            countField:'count',
            dataField:'users',
            url:'/api/admin/get/users',
            id:'users-data',
            noDataFound : NoDataFound({msg: 'No users found!'}).html(),
            showTableHead:'hide',
            cols : {
                user: {
                    html:(r) => {
                        let action = `<a href="#/admin/channels?userId=${r.id}&userName=${encodeURIComponent(r.firstName+' '+r.lastName)}" class="page-view  btn btn-sm btn-outline-primary btn-circle"><i class="fa fa-folder"></i> VIEW CHANNELS</a>`;
                        if(r.status == 'ACTIVE')
                            action += `<button class="ml-1 btn btn-sm btn-outline-danger btn-circle" onclick="AllUsers.blockUser(${r.id})"><i class="fas fa-lock"></i> BLOCK </button>`;
                        else if(r.status == 'BLOCKED')
                            action += `<button class="ml-1 btn btn-sm btn-outline-success btn-circle" onclick="AllUsers.unblockUser(${r.id})"><i class="fas fa-unlock-alt"></i> UNBLOCK </button>`;
                        

                        return `
                            <div class="row">
                                <div class="col-md-2">
                                    <div class="p-1">
                                        <img src="${r.avatar!=null? r.avatar : '/static/assets/images/user-placeholder.jpg'}" alt="avatar" class="rounded-circle" style="height:150px;width:150px;border:1px solid #ccc;"/>
                                    </div>
                                </div>
                                <div class="col-md-9">
                                    <label class="capitalize small text-muted">User Name</label>
                                    <p><span class="capitalize"><strong>${r.firstName} ${r.lastName}</strong></span> ( <span class="text-muted">${r.email.toLowerCase()}</span> )</p>

                                    <div class="row">
                                        <div class="col-md-2">
                                            <label class="capitalize small text-muted">Role</label>
                                            <p class="capitalize">${r.status}</p>
                                        </div>
                                        <div class="col-md-2">
                                            <label class="capitalize small text-muted">Role</label>
                                            <p class="capitalize">${ r.UserRoleMappings && r.UserRoleMappings.length > 0 ? r.UserRoleMappings.map(m => m.Role['name']).join(',') : ''}</p>    
                                        </div>
                                        <div class="col-md-6">
                                            <label class="capitalize small text-muted">Action</label>
                                            <p>${action}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                }
            }
        })

        //loadLinks();
    }
    
    static searchBtn(){
        let email = $("#search-user").val();
        AllUsers.userTable.reloadByUrl(`/api/admin/get/users?userEmail=${email}`);
    }
    static blockUser(userId){
        http().post({url:`/api/admin/user/${userId}/block`, data:{}}).then(r => {
            AllUsers.userTable.reload();
        })
    }

    static unblockUser(userId){
        http().post({url:`/api/admin/user/${userId}/unblock`, data:{}}).then(r => {
            AllUsers.userTable.reload();
        })
    }

    async html(){
        return (`
            <div class="container-fluid">
                ${PageHeading({ heading: 'TI USERS DATA', next:[
                    {link:'#/admin/users', label:'<i class="fas fa-user"></i> Users'},
                    {link:'#/admin/video/publish/request', label:'<i class="fas fa-bell"></i> Publish Request'}
                ]})}
                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-body"  id="users-data">
                                <form>

                                <div class="input-group mb-3">
                                <input type="text" class="form-control" placeholder="Enter email..." id="search-user">
                                <div class="input-group-append">
                                    <span class="btn btn-hover-red" id="basic-addon2"  onclick="AllUsers.searchBtn()">search</span>
                                </div>
                                </div>
                                </form>

                                <div id="users-data" class="mt-2"></div>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class AllVideos {
    
    static videoTable = undefined;
    
    constructor({el, query}){
        this.el = el;
        this.query = query;
        
        this.init();
    }

    static playVideoInPopUp(hash, videoTitle){
        $('#bs-modal-wrapper').html(modal({body: ViPlayer({hash}), heading: `<i class="fas fa-play-circle"></i> ${videoTitle}`, id:'popup-video-player'}))
        $('#popup-video-player').modal('show');
        let vjs = initializePlayer();
        vjs.play();
        $('#close-modal').on('click', (e) => {
            vjs.pause();
            $('#popup-video-player').modal('hide');
           return true;
        })
    }

    
    async init(){}

    async viewInit(){
       
        AllVideos.videoTable = new DataTable({
            countField:'count',
            dataField:'videos',
            url:`/api/admin/get/user/${this.query['userId']}/channel/${this.query['channelId']}/videos`,
            id:'videos-data',
            showTableHead:'hide',
            noDataFound : NoDataFound({msg: 'No videos found!'}).html(),
            cols : {
                poster : {
                    alias:'Poster',
                    html : (r) => {
                        let poster = '/static/assets/images/video-thumbs/2.webp';
                        if(r.poster){
                            let {baseDir, screenshots } = JSON.parse(r.poster);
                            if(baseDir && screenshots && screenshots.length > 0)
                                poster = baseDir.concat('/' + screenshots[1]);
                        }  

                        let action = '';
                        if(r.status == 'PUBLISHED')
                            action= `<button class="btn btn-sm btn-outline-danger" onclick="AllVideos.blockVideo(${r.id})"><i class="fas fa-lock"></i> BLOCK </button>`;
                        else if(r.status == 'BLOCKED')
                            action= `<button class="btn btn-sm btn-outline-success" onclick="AllVideos.unblockVideo(${r.id})"><i class="fas fa-unlock-alt"></i> UNBLOCK </button>`;
                        else if(r.status == 'REJECTED')
                            action= `<button class="btn btn-sm btn-outline-success" onclick="AllVideos.unblockVideo(${r.id})"><i class="fas fa-unlock-alt"></i> PENDING </button>`;
                        
                        return `
                        <div class="row">
                            <div class="col-md-3">
                            <div class="border p-1">
                            <div class="thmbsimg" style="background-image:url(${poster});background-size:cover;border-radius:0;padding:5px;border:1px solid #ccc;">
                                <div class="middle">
                                    <a href="javascript:AllVideos.playVideoInPopUp('${r.hash}','${r.name}')" >
                                        <div class="text"><i class="fa fa-play" aria-hidden="true"></i></div>
                                    </a>
                                </div>
                            </div>
                            </div>
                            </div>
                            <div class="col-md-9">
                                <label class="text-muted small capitalize">Video Title</label>
                                <h4 class="capitalize">${r.name}</h4>

                                <label class="text-muted small capitalize">Video Description</label>
                                <p class="capitalize">${r.description}</p>

                                <div class="row">
                                    <div class="col-md-4">
                                        <label class="text-muted small capitalize">Channel Name</label>
                                        <p><a href="#/ti/channel/videos?id=${r.channelId}&name=CHANNEL_VIDEOS" class="page-view"><i class="fa fa-folder"></i> ${r.channelName}</a></p>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="text-muted small capitalize">Creator</label>
                                        <p><a href="#/admin/user?userId=${r.userId}" class="page-view"><i class="fa fa-user"></i> ${r.creator}</a></p>    
                                    </div>
                                    <div class="col-md-4">
                                        <label class="capitalize small text-muted">Action</label>
                                        <p>${action}</p>
                                    </div>
                                </div>
                                

                                <p class="text-muted">
                                    <small>${r.createdAt}</small>
                                    <span class="seprater"><i class="fas fa-circle"></i></span>
                                    <small>${r.visibility == 0 ? 'PRIVATE' : 'PUBLIC'}</small>
                                    <span class="seprater"><i class="fas fa-circle"></i></span>
                                    <small>${r.status}</small>
                                </p>
                            </div>
                        </div>`   
                    }
                }
            }
        })

        //loadLinks();
    }
    
    static blockVideo(videoId){
        http().post({url:`/api/admin/video/${videoId}/block`, data:{}}).then(r => {
            AllVideos.videoTable.reload();
        })
    }

    static unblockVideo(videoId){
        http().post({url:`/api/admin/video/${videoId}/unblock`, data:{}}).then(r => {
            AllVideos.videoTable.reload();
        })
    }

    async html(){
        return (`
            <div class="container-fluid">
            ${PageHeading({ heading: 'VIDEOS COLLECTION', next:[
                {link:'#/admin/users', label:'<i class="fas fa-user"></i> Users'},
                {link:'#/admin/video/publish/request', label:'<i class="fas fa-bell"></i> Publish Request'}
            ]})}

                <div class="row">
                    <div class="col-md-12">
                        
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-body" >

                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb">
                                <li class="breadcrumb-item capitalize" title="User Name"><i class="fa fa-user p-1"></i> ${this.query['userName'].toLowerCase()}</li>
                                <li class="breadcrumb-item capitalize" title="Channel Name"><i class="fa fa-folder p-1"></i> ${this.query['channelName']?.toLowerCase()}</li>
                                <li class="breadcrumb-item capitalize active" title="Videos List"><i class="fa fa-video p-1"></i> Videos</li>
                                </ol>
                            </nav>
                                <div id="videos-data"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class VideoPublishRequest {

    static videoTable = undefined;
    
    constructor({el, query}){
        this.el = el;
        this.query = query;
        
        this.init();
    }
    
    static playVideoInPopUp(hash, videoTitle){
        $('#bs-modal-wrapper').html(modal({body: ViPlayer({hash}), heading: `<i class="fas fa-play-circle"></i> ${videoTitle}`, id:'popup-video-player'}))
        $('#popup-video-player').modal('show');
        let vjs = initializePlayer();
        vjs.play();
        $('#close-modal').on('click', (e) => {
            vjs.pause();
            $('#popup-video-player').modal('hide');
           return true;
        })
    }
    async init(){}

    async viewInit(){
        
        VideoPublishRequest.videoTable = new DataTable({
            countField:'count',
            dataField:'videos',
            url:`/api/admin/get/video/request?status=PENDING`,
            id:'videos-data',
            showTableHead:'hide',
            noDataFound : NoDataFound({msg: 'No publish video request found!'}).html(),
            cols : {
                name : {
                    alias:'Video',
                    html:(r)=> {

                        let poster = '/static/assets/images/video-thumbs/2.webp';
                        if(r.poster){
                            let {baseDir, screenshots } = JSON.parse(r.poster);
                            if(baseDir && screenshots && screenshots.length > 0)
                                poster = baseDir.concat('/' + screenshots[1]);
                        }  

                        let action = r.status == 'PENDING' ? 
                        `<button class="btn btn-sm btn-outline-danger btn-circle" onclick="VideoPublishRequest.reject(${r.id})"><i class="fas fa-minus-circle"></i> Reject </button>
                        <button class="btn btn-sm btn-outline-success btn-circle" onclick="VideoPublishRequest.publish(${r.id})"><i class="fas fa-check-circle"></i> PUBLISH </button>`
                        : ``;

                        return `
                        <div class="row">
                            <div class="col-sm-5 col-md-3">
                            <div class="border p-1">
                            <div class="thmbsimg" style="background-image:url(${poster});background-size:cover;border-radius:0px;border:1px solid #ccc;">
                                <div class="middle">
                                    <a href="javascript:VideoPublishRequest.playVideoInPopUp('${r.hash}','${r.name}')" >
                                        <div class="text"><i class="fa fa-play" aria-hidden="true"></i></div>
                                    </a>
                                </div>
                            </div>
                            </div>
                            </div>
                            <div class="col-sm-7 col-md-9">
                                <label class="capitalize small text-muted">Video Title</label>
                                <h4 class="capitalize">${r.name}</h4>

                                <label class="capitalize small text-muted">Video Description</label>
                                <p class="capitalize">${r.description}</p>
                                
                                
                                

                                <div class="row">
                                    <div class="col-md-4">
                                        <label class="capitalize small text-muted">Channel Name</label>
                                        <p class="capitalize"><a href="#/ti/channel/videos?id=${r.Channel.id}&name=CHANNEL_VIDEOS" class="page-view"><i class="fa fa-folder"></i> ${r.Channel.name}</a></p>            
                                    </div>
                                    <div class="col-md-4">
                                        <label class="capitalize small text-muted">Creator</label>
                                        <p class="capitalize"><a href="#/admin/user?userId=${r.User.id}" class="page-view"><i class="fa fa-user"></i> ${r.User.firstName} ${r.User.lastName}</a></p>
                                   </div>
                                    <div class="col-md-4">
                                        <label class="capitalize small text-muted">Action</label>
                                        <p>${action}</p>
                                    </div>
                                </div>


                                <p class="small text-muted">
                                    <span>${r.createdAt}</span>
                                    <span class="seprater"><i class="fas fa-circle"></i></span>
                                    <span>${r.visibility == 0 ? 'PRIVATE' : 'PUBLIC'}</span>
                                    <span class="seprater"><i class="fas fa-circle"></i></span>
                                    <span>${r.status}</span>
                                </p>
                                
                            </div>
                        </div>`
                    }
                }
            }
        })

        //loadLinks();
    }

    static reject(videoId){
        http().post({url:'/api/admin/post/publish-reject/video', data:{ videoId, videoStatus : 'REJECTED'}}).then(r => {
            VideoPublishRequest.videoTable.reload();
        }) 
    }

    static publish(videoId){
        http().post({url:'/api/admin/post/publish-reject/video', data:{ videoId, videoStatus : 'PUBLISHED'}}).then(r => {
            VideoPublishRequest.videoTable.reload();
        })
    }

    async html(){
        return (`
            <div class="container-fluid">
                ${PageHeading({ heading: 'VIDEO PUBLISH REQUEST', next:[
                    {link:'#/admin/users', label:'<i class="fas fa-user"></i> Users'},
                    {link:'#/admin/video/publish/request', label:'<i class="fas fa-bell"></i> Publish Request'}
                ]})}
                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-body" id="videos-data">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class AllChannels {

    static channelTable = undefined;

    constructor({el, query }){
        this.el = el;
        this.query = query;
        this.init();
    }
    
    async init(){}

    async viewInit(){

        AllChannels.channelTable = new DataTable({
            countField:'count',
            dataField:'channels',
            url:`/api/admin/get/user/${this.query['userId']}/channels`,
            id:'channels-data',
            showTableHead:'hide',
            noDataFound : NoDataFound({msg: 'No channel found!'}).html(),
            cols : {
                name: {
                    alias:'Channel',
                    html : (r) => {

                        let action = `<a href="#/admin/videos?userId=${r.User.id}&channelId=${r.id}&userName=${encodeURIComponent(r.User.firstName + ' ' + r.User.lastName)}&channelName=${encodeURIComponent(r.name)}" class="page-view btn btn-sm btn-circle btn-outline-primary"><i class="fas fa-video"></i> VIEW VIDEOS</a>`;

                        if(r.status == 'PUBLISHED')
                            action += ` <button class="btn btn-sm btn-outline-danger btn-circle" onclick="AllChannels.blockChannel(${r.id})"><i class="fas fa-lock"></i> BLOCK </button>`;
                        else if(r.status == 'BLOCKED')
                            action += ` <button class="btn btn-sm btn-outline-success btn-circle" onclick="AllChannels.unblockChannel(${r.id})"><i class="fas fa-unlock-alt"></i> UNBLOCK </button>`;
                        
                        
                        return `
                        <div class="row">
                            <div class="col-sm-5 col-md-3">
                            <div class="border p-1">
                            <div class="thmbsimg" style="background-image:url(${r.channelArt});background-size:cover; border-radius:0;border:1px solid #ccc;">
                            </div>
                            </div>
                            </div>
                            <div class="col-sm-7 col-md-9">
                                <label class="capitalize small text-muted">Channel Name</label>
                                <h4 class="capitalize">${r.name}</h4>
                                
                                <label class="capitalize small text-muted">Description</label>
                                <p class="capitalize">${r.description}</p>
                                
                                
                                <div class="row">
                                    <div class="col-md-4">
                                        <label class="capitalize small text-muted">Creator</label>
                                        <p class="capitalize"><a href="#/admin/user?userId=${r.User.id}"> <i class="fa fa-user"></i> ${r.User.firstName} ${r.User.lastName}</a></p>        
                                    </div>
                                    <div class="col-md-6">
                                        <label class="capitalize small text-muted">Action</label>
                                        <p>${action}</p>
                                    </div>
                                </div>

                                <p class="small text-muted">
                                    <span>${r.createdAt}</span>
                                    <span class="seprater"><i class="fas fa-circle"></i></span>
                                    <span>${r.visibility == 0 ? 'PRIVATE' : 'PUBLIC'}</span>
                                    <span class="seprater"><i class="fas fa-circle"></i></span>
                                    <span>${r.status}</span>
                                    <span class="seprater"><i class="fas fa-circle"></i></span>
                                </p>

                                
                            </div>
                        </div>`
                    }
                }
            }
        })

        //loadLinks();
    }

    
    static blockChannel(channelId){
        http().post({url:`/api/admin/channel/${channelId}/block`, data:{}}).then(r => {
            AllChannels.channelTable.reload();
        })
    }

    static unblockChannel(channelId){
        http().post({url:`/api/admin/channel/${channelId}/unblock`, data:{}}).then(r => {
            AllChannels.channelTable.reload();
        })
    }

    async html(){
        return (`
            <div class="container-fluid">
            ${PageHeading({heading: 'CHANNELS COLLECTION', next:[
                {link:'#/admin/users', label:'<i class="fas fa-user"></i> Users'},
                {link:'#/admin/video/publish/request', label:'<i class="fas fa-bell"></i> Publish Request'}
            ]})}
                <div class="row">
                    <div class="col-md-12">
                        
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-body">
                                <nav aria-label="breadcrumb">
                                    <ol class="breadcrumb">
                                        <li class="breadcrumb-item capitalize" title="User Name"><i class="fa fa-user p-1"></i> ${this.query['userName']?.toLowerCase()}</li>
                                        <li class="breadcrumb-item capitalize active" title="Channels List"><i class="fa fa-folder p-1"></i> Channels </li>
                                    </ol>
                                </nav>
                                <div id="channels-data">
                                
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

class AdminDashboard {

    constructor({el}){
        this.el = el;
        this.user = undefined;
        this.video = undefined;
        this.channel = undefined;
        this.init();
    }
    
    async init(){
        http().get({url:'/api/admin/get/statistic'}).then(r => {
            this.user = r.user;
            this.video = r.video;
            this.channel = r.channel;
            this.render();
        })
    }

    async viewInit(){
        //loadLinks();
    }

    async html(){
        let channelDetails = 'Loading...', videoDetails = 'Loading...', userDetails = 'Loading...';

        if(this.user){
            userDetails = this.user.map(u => {
                return `<p class="text-center"><span class="badge badge-primary">${u.count}</span> ${u.status}</p>`
            }).join('')
        }

        if(this.video){
            videoDetails = this.video.map(u => {
                return `<p class="text-center"><span class="badge badge-primary">${u.count}</span> ${u.status} ${u.visibility == 1 ? 'PUBLIC' : 'PRIVATE'}</p>`
            }).join('')
        }

        if(this.channel){
            channelDetails = this.channel.map(u => {
                return `<p class="text-center"><span class="badge badge-primary">${u.count}</span> ${u.status} ${u.visibility == 1 ? 'PUBLIC' : 'PRIVATE'}</p>`
            }).join('')
        }

        return (`<div class="container-fluid">

            ${PageHeading({back:{
                show: false,
                link:''
            },heading:'ADMIN DASHBOARD', next:[
                {link:'#/admin/users', label:'<i class="fas fa-user"></i> Users'},
                {link:'#/admin/video/publish/request', label:'<i class="fas fa-bell"></i> Publish Request'}
            ]})}

            <div class="row">
                <div class="col-md-4">
                    <div class="card mb-2">
                        <div class="card-body bg-primary text-white">
                            <h4 class="text-center">USERS</h4>
                            <hr/>
                            <div>${userDetails}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card mb-2">
                        <div class="card-body bg-warning text-white">
                            <h4 class="text-center">CHANNELS</h4>
                            <hr/>
                            <div>${channelDetails}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card mb-2">
                        <div class="card-body bg-info text-white">
                            <h4 class="text-center">VIDEOS</h4>
                            <hr/>
                            <div>${videoDetails}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`);
    }

    async render(){
        document.getElementById(this.el).innerHTML = await this.html();
        this.viewInit();
    }
}

// end admin


// --------------------------------------------------

let mvc = new MVC("stream-app");

let guard = ( route ) => {
    let result = {}
    let { path } = route;
    let { isLoggedIn, fullname, email, roles } = mvc.extractCookies(document.cookie);

    if(path.startsWith('/account/logout'))
        result = { allow: true }; 
    else if(isLoggedIn === 'true'){
        let roleList = roles ? roles.split('-') : [];
        
        if(path.startsWith('/auth/'))
            result = { allow: false, redirect:'/home' }
        else if(roleList.includes('ADMIN') && path == '')    
            result = { allow: false, redirect:'/admin/dashboard'}
        else if(path.startsWith('/user/') && roleList.includes('USER'))
            result = { allow: true }
        else if(path.startsWith('/admin/') && roleList.includes('ADMIN'))
            result = { allow: true };
        else if(path.startsWith('/account/') && (roleList.includes('USER') || roleList.includes('ADMIN')))
            result = { allow: true };
        else if(!path.startsWith('/account/') && !path.startsWith('/user/') && !path.startsWith('/admin/') )
            result = { allow: true };
        else 
            result = { allow: false, redirect:'/home'}
    } else {
        if(path.startsWith('/user/') || path.startsWith('/admin/') || path.startsWith('/account/'))
            result = { allow: false, redirect:'/home'};
        else 
            result = { allow: true};
    }

    if(path.startsWith('/auth/')){
        if($('#tiv-header'))
            $('#tiv-header').hide();
        if(document.querySelector('#mainwrap'))
            document.querySelector('#mainwrap').style.marginTop = 0 + 'px';
    } else {
        if($('#tiv-header'))
            $('#tiv-header').show();
        if(document.querySelector('#mainwrap'))
            document.querySelector('#mainwrap').style.marginTop = document.querySelector('#tiv-header').offsetHeight + 'px';
    }

    return result;
}


// Public Routes
mvc.addRoute({path:'', component: Home, authGuard: guard});
mvc.addRoute({path:'/home', component: Home, authGuard: guard});
mvc.addRoute({path:'/about', component: About, authGuard: guard});
mvc.addRoute({path:'/contact', component: Contact, authGuard: guard});
mvc.addRoute({path:'/video/category', component: CategoryVideos, authGuard: guard});
mvc.addRoute({path:'/video/watch', component : VideoStream, authGuard: guard});
mvc.addRoute({path:'/ti/channels', component: TiUserChannels, authGuard: guard});
mvc.addRoute({path:'/ti/channel/videos', component: TiUserChannelVideos, authGuard: guard});
mvc.addRoute({path:'/ti/user', component: TiUser, authGuard: guard});
mvc.addRoute({path:'/search', component: Search, authGuard: guard});
mvc.addRoute({path:'/404', component : PageNotFound, authGuard: guard });

// Auth Routes
mvc.addRoute({path:'/auth/login', component: Login, authGuard: guard});
mvc.addRoute({path:'/auth/register', component: Register, authGuard: guard});
mvc.addRoute({path:'/auth/forget/password', component: ForgetPassword, authGuard: guard});
mvc.addRoute({path:'/account/logout', component: Logout, authGuard: guard});
mvc.addRoute({path:'/auth/sign-up/otp/validation', component: SignUpOTP, authGuard: guard});

// User Routes
mvc.addRoute({path:'/account/profile', component: UserProfile , authGuard: guard});
mvc.addRoute({path:'/account/profile/settings', component: UserProfileSettings, authGuard: guard});
mvc.addRoute({path:'/user/channels', component: MyChannels, authGuard: guard});
mvc.addRoute({path:'/user/channel/videos', component: MyChannelVideos, authGuard: guard});
mvc.addRoute({path:'/user/channel/create', component: CreateChannel, authGuard: guard});
mvc.addRoute({path:'/user/video/upload', component: UploadVideo, authGuard: guard});
mvc.addRoute({path:'/account/profile/update/password', component: UpdatePassword, authGuard: guard});

// Admin Routes
mvc.addRoute({path:'/admin/users', component: AllUsers, authGuard: guard});
mvc.addRoute({path:'/admin/user', component: TiUser, authGuard: guard});
mvc.addRoute({path:'/admin/channels', component: AllChannels, authGuard: guard});
mvc.addRoute({path:'/admin/videos', component: AllVideos, authGuard: guard});
mvc.addRoute({path:'/admin/dashboard', component: AdminDashboard, authGuard: guard});
mvc.addRoute({path:'/admin/video/publish/request', component: VideoPublishRequest, authGuard: guard});


window.onhashchange = () => {
    mvc.load()
};

window.addEventListener('DOMContentLoaded', (e) => {
    mvc.load()
});

window.addEventListener('resize', () => {
    document.querySelector('#mainwrap').style.marginTop = document.querySelector('#tiv-header').offsetHeight + 'px';
});