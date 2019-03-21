var express = require('express')
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var environment = require('./environments')
var PropertiesReader = require('properties-reader')


const PORT = process.env.PORT || 8080;

var properties = new PropertiesReader(environment)
clientID = properties.get('main.clientID')
clientSecret = properties.get('main.clientSecret')
callbackURL = properties.get('main.callbackURL')

passport.use(new GoogleStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    if (profile) {
        user = profile;
        return done(null, user);
    } else {
        return done(null, false);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var app = express()
app.use(passport.initialize())
app.use(passport.session())


app.get('/', (req, res) => {
	res.status(200).send('<a href="/auth/google">Sign In with Google</a>')
})

app.get('/private', (req, res) => {
	res.status(200).send('Private Page')
})

app.get('/error', (req, res) => {
	res.status(200).send('Error Page')
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
)

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/private');
});

app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) })
