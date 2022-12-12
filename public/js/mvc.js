

class MVC {
    constructor(el){
        this.routes = {}
        this.matchRoute = {};
        this.el = el;
        this.query = {};
        this.history = [];
    }

    addRoute({path, component, authGuard, redirect}){
        this.routes[path] = {path, component, authGuard, redirect};
    }

    extractQuery(path){
        this.query = {};
        if(path.split('?').length > 1) 
            path.split('?')[1].split('&').map(q => this.query[q.split('=')[0]] = decodeURIComponent(q.split('=')[1])) ; 
    }

    extractCookies(cookies){
        let _cookies = {};
        if(cookies != undefined && cookies.trim().length > 0){
            cookies.split(';').map(cookie => cookie.trim()).map(cookie => _cookies[cookie.split('=')[0]]= decodeURI(cookie.split('=')[1]));
        }
        return _cookies;
    }

    validateLocationHash(path){
        if(window.location.hash.replace('#','') != path){
            window.location.hash = path;
        }
    }

    scrollToTop(){
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }

    async navigate({path}){
        console.log(path)
        this.validateLocationHash(path);
        this.matchRoute = this.routes[path.split('?')[0]];
        if(this.matchRoute){
            this.extractQuery(path);
            this.matchRoute = { ...this.matchRoute, query: this.query }
            if(this.matchRoute.redirect) {
                this.navigate({path: this.matchRoute.redirect});
            }   else if(!this.matchRoute.authGuard) {
                    document.getElementById(this.el).innerHTML = '';
                    await new this.matchRoute.component({el: this.el, query: this.query}).render();
                    this.scrollToTop();
            }   else if(this.matchRoute.authGuard) {
                    let auth = this.matchRoute.authGuard(this.matchRoute);
                    if(auth.allow) {
                        document.getElementById(this.el).innerHTML = '';
                        await new this.matchRoute.component({el: this.el, query: this.query}).render();
                        this.scrollToTop();
                    } else {
                        this.navigate({path: auth.redirect});
                    }
                }
        } else {
            window.location.hash = "/404";
            this.navigate({path:'/404'})
        }
    }

    load(){
        let path = (window.location.hash).replace('#','');
        path = path.replace(window.location.origin,'');
        this.navigate({path});
    }
}