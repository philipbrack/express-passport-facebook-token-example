var express = require('express');
var passport = require('passport');

var FacebookTokenStrategy = require('passport-facebook-token');


//CORS middleware  In my configuration the client is running localhost:4200
var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  next();
}

passport.use(new FacebookTokenStrategy({
  clientID: '<TODO>',
  clientSecret: '<TODO>'
}, function (accessToken, refreshToken, profile, done) {
  let user = {
    'email': profile.emails[0].value,
    'name': profile.name.givenName + ' ' + profile.name.familyName,
    'id': profile.id,
    'token': accessToken
  };

  // You can perform any necessary actions with your user at this point,
  // e.g. internal verification against a users table,
  // creating new user entries, etc.

  return done(null, user); // the user object we just made gets passed to the route's controller as `req.user`

}));

// Create a new Express application.
var app = express();


// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({extended: true}));
app.use(allowCrossDomain);

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());


//  For my app I plan to make this the GraphQL end-point
app.get(
  "/protected",
  (req, res) => {

    // calling this so as to catch error and respond without 500 and pass all the details to the user.
    passport.authenticate('facebook-token', {session: false}, function (err, user, info) {


      console.log('insde endpoint', user);
      //console.log('error', err, 'user', user, 'info', info);
      if (err) {
        if (err.oauthError) {
          var oauthError = JSON.parse(err.oauthError.data);
          res.status(401).send(oauthError.error.message);
        } else {
          res.send(err);
        }
      } else {
        // do the logic of actual end point here.
        res.send(user);
      }
    })(req, res);
  });

console.log('running on port 3000');
app.listen(3000);
