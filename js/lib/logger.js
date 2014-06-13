module.exports = {
    log: function() {
        console.log.apply(console, arguments);
    },
    error: function() {
        console.error.apply(console, arguments);
    },
};
