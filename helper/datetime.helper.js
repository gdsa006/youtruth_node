module.exports = {
    getDateTimeString : (date) => {
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
    },
    getDateString : (date) => {
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    },
    getTimeString : (date) => {
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
    }
}