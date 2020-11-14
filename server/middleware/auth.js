const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  console.log('REQ HERE', res.cookies);
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

const verifySession = function(res, req, next) {
  parseCookies(req, res, next);
  createSession(req, res, next);
  if ( !req.cookies.shortlyid ) {
    res.status(200);
    res.location('/login');
    res.render('login');
  }
};