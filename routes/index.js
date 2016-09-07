//exports.article = require('./article');
exports.user = require('./user');

/*
 * GET home page. The senz page
 */

exports.index = function(req, res, next){
    res.render('login');
};



