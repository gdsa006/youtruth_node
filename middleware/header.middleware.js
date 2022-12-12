module.exports = (req, res, next) => {

    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    var url = req.url;
    if(url.indexOf('?')>0)
        url = url.substr(0,url.indexOf('?'));
    if(! url.match(/(js|jpg|png|ico|css|woff|woff2|eot)$/ig)) {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'); 
    }
    next();
}