const models = require('../models');
const Promise = require('bluebird');

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

const parseCookies = (req) => {
  let cookieObj = {};
  if (req.headers.cookie) {
    let headerCookie = req.headers.cookie;
    let cookieArray = headerCookie.split('; ');
    for (let i = 0; i < cookieArray.length; i++) {
      let splitCookie = cookieArray[i].split('=');
      cookieObj[splitCookie[0]] = splitCookie[1];
    }
  }
  req.cookies = cookieObj;
};

module.exports.verifySession = function(req) {
  return new Promise((resolve, reject) => {
    parseCookies(req);
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