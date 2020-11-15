const models = require('../models');
const Promise = require('bluebird');
const Cookies = require('./cookieParser');

module.exports.createSession = (req, res, next) => {
  models.Sessions.create()
    .then((result) => {
      return models.Sessions.get({id: result.insertId});
    })
    .then((result) => {
      req.session = {};
      req.session = result;
      res.cookie('shortlyid', result.hash);
      res.location('/');
      res.render('index');
      res.status(200);
      next();
    });
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/


module.exports.verifySession = function(req) {
  return new Promise((resolve, reject) => {
    Cookies.parseCookies(req);
    let cookies = req.cookies;
    if (cookies.shortlyid) {
      models.Sessions.get({hash: cookies.shortlyid})
        .then((result) => {
          if (result !== undefined) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
    }
  });
};

module.exports.deleteSession = function(cookie) {
  return new Promise((resolve, reject) => {
    models.Sessions.delete({ hash: cookie})
      .then((result) => {
        resolve('Session successfully deleted');
      });
  });
};