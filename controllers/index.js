const hiControllers = require('./hi');
const ajaxControllers = require('./ajax');

module.exports = exports = {
    ...hiControllers,
    ...ajaxControllers,
};
