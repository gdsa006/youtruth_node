module.exports = {
    form : require('./form.middleware'),
    auth : require('./auth.middleware'),
    header : require('./header.middleware'),
    errorFeedback : require('./errorFeedback.middleware')
}