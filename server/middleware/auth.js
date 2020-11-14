const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  if (req.cookies.shortlyid === undefined) {
    models.Sessions.create()
      .then((result) => {
        return models.Sessions.get({id: result.insertId});
      })
      .then((result) => {
        req.session = {};
        req.session = result;
        res.cookies.shortlyid = {value: result.hash};
        next();
      });
  } else {
    models.Sessions.get({hash: req.cookies.shortlyid})
      .then((result) => {
        if (result !== undefined) {
          req.session = {};
          req.session = result;
          res.cookies.shortlyid = {value: result.hash};
          next();
        } else {
          models.Sessions.create()
            .then((result) => {
              return models.Sessions.get({id: result.insertId});
            })
            .then((result) => {
              req.session = {};
              req.session = result;
              res.cookies.shortlyid = {value: result.hash};
              next();
            });
        }
      });
  }
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
  parseCookies(req);
  let cookies = req.cookies;
  if (cookies.shortlyid) {
    models.Sessions.get({hash: cookies.shortlyid})
      .then((result) => {
        if (result) {
          return true;
        }
      });
  }
  return false;
};
