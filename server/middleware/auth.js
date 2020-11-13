const models = require('../models');
const Promise = require('bluebird');
const Cookies = require('./cookieParser');

module.exports.createSession = (req, res, next) => {
  if (req.headers.cookie) {
    let hash = models.Sessions.create();
    req.session = hash;
  } else {
    let cookies = Cookies.parseCookies();

  }
  next();
  // that should crete cooke for us
  // then  we post query the database for the session table
  // models.sessions.create
  // set to response sessions
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

