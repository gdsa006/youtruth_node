const { validationResult } = require('express-validator');
const logger = require('../config/logger').getLogger('Error Feedback Middleware')
module.exports = (req, res, next) => {
    logger.info(' error feedback middleware ececuting')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let e = errors.array().map((err,i) => `* ${err.msg}`).join('<br/>')
        return res.status(400).jsonp({ status:"error", validation: [e], data:req.body });
    }
    next();
}