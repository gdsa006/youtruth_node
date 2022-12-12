require('dotenv').config();
require('ejs');
const http = require('http')
const https = require('https')
const fs = require('fs')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const layouts = require('express-ejs-layouts');
const cors = require('cors');
const csurf = require('csurf');
const uuid = require('uuid');
const morgan = require('morgan');
const cron = require('./cron');

const logger = require('./config/logger').getLogger('Http');

const { auth } = require('./middleware');

const PORT = process.env.PORT;
const env = process.env.ENV;

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(layouts);

app.use('/static', express.static('public'));
app.use('/data', express.static('data'));
app.use('/media', express.static(process.env.UPLOAD_BASE_DIR));

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({extended:false,limit: '5mb'}));

var csrf = csurf({ cookie: true })

app.use(cookieParser('tfedugiey86'));
app.use(cors())

// auth middleware
app.use(auth.authorize);

// ui routes
app.get('/', (req, res) => res.redirect('/app/'));
app.get('/app/**',(req, res) => res.render('ui'));

// apis route
app.use('/api/', require('./controller/public.controller')(csrf))
app.use('/api/account', require('./controller/account.controller')(csrf))
app.use('/api/admin', require('./controller/admin.controller')(csrf))
app.use('/api/auth', require('./controller/auth.controller')(csrf))
app.use('/api/user', require('./controller/user.controller')(csrf))

app.use((req, res) => res.render('pages/404'))


// csrf token error handler
app.use(function(err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next()
    res.status(403)
    res.jsonp({
        status: 'error',
        validation: ['Invalid or missing CSRF token']
    })
}) ;

const { database } = require('./database/model');

let ssl_conf = {
    key: fs.readFileSync(path.join(__dirname, 'ssl','youtruth_video.key'), 'utf8'),
    cert: fs.readFileSync(path.join(__dirname, 'ssl','youtruth_video.crt'), 'utf8'),
    ca: fs.readFileSync(path.join(__dirname, 'ssl','youtruth_video.ca-bundle'), 'utf8')
}

try{

    database.authenticate();
    logger.info('Database connected !');
    logger.info('Syncing models...');

    database.sync().then(result => {
        cron.start();
        if(env === 'PROD'){
            https.createServer(ssl_conf, app).listen(443);
            http.createServer((req, res) => {
                res.statusCode = 301;
                res.setHeader('Location', `https://youtruth.video${req.url}`);
                res.end();
           }).listen(PORT);
            logger.info(`Production server connected on ${PORT}`)
        } else {
            http.createServer(app).listen(PORT);
            logger.info(`Development server connected on ${PORT}`)
        }
        
    }).catch(error => {
        logger.error(error)
    })
    
} catch (error) {
    logger.error(error)
}

let stopServer = () => {
    console.log('server shutting down');
}

process.on('SIGTERM', stopServer);
process.on('SIGINT', stopServer);





