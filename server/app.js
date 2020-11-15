const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/',
  (req, res) => {
    Auth.verifySession(req)
      .then((validSession) => {
        if (validSession) {
          res.render('index');
        } else {
          res.redirect('login');
        }
      });
  });

app.get('/create',
  (req, res) => {
    Auth.verifySession(req)
      .then((validSession) => {
        if (validSession) {
          res.render('index');
        } else {
          res.redirect('login');
        }
      });
  });

app.get('/links',
  (req, res, next) => {
    Auth.verifySession(req)
      .then((validSession) => {
        if (validSession) {
          models.Links.getAll()
            .then(links => {
              res.status(200).send(links);
            })
            .error(error => {
              res.status(500).send(error);
            });
        } else {
          res.redirect('login');
        }
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/login',
  (req, res, next) => {
    res.status(200);
    res.location('/login');
    res.render('login');
    next();
  });

app.post('/login',
  (req, res, next) => {
    models.Users.get({username: req.body.username})
      .then((results) => {
        if (results === undefined) {
          res.location('/login');
          res.render('login');
          next();
        }
        let pwMatch = models.Users.compare(req.body.password, results.password, results.salt);
        if (pwMatch) {
          Auth.createSession(req, res, next);
        } else {
          res.location('/login');
          res.render('login');
          next();
        }
      })
      .catch(error => {
        res.status(404);
        next();
      });
  });

app.get('/signup',
  (req, res, next) => {
    res.render('signup');
    next();
  });

app.post('/signup',
  (req, res, next) => {
    let userObj = {};
    userObj.username = req.body.username;
    userObj.password = req.body.password;
    models.Users.create(userObj)
      .then((result) => {
        Auth.createSession(req, res, next);
      })
      .catch((err) => {
        res.location('/signup');
        res.render('signup');
        next();
      });
  });

//logout handler, can't figure out how to add to client since sprint said don't worry about client, its 6pm on Sat and I'm just going to write this as if I knew how to add the button on the client side
app.delete('/',
  (req, res, next) => {
    Auth.parseCookies(req);
    let hash = req.cookies.shortlyid;
    Auth.deleteSession(hash)
      .then((result) => {
        res.render('login');
        next();
      });
  });


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
