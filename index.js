var express = require('express')
var bodyParser = require('body-parser')
var passport = require('passport');
var refresh = require('passport-oauth2-refresh')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var environment = require('./environments')
var PropertiesReader = require('properties-reader')
var axios = require('axios')

var {Datastore} = require('@google-cloud/datastore')

var tokenmanager = require('./tokenmanager.js')

const PORT = process.env.PORT || 8080;

var properties = new PropertiesReader(environment)
var clientID = properties.get('main.clientID')
var clientSecret = properties.get('main.clientSecret')
var callbackURL = properties.get('main.callbackURL')

// TODO: Persist token to data store
var googleRefreshToken = properties.get('google.refreshToken')

// TODO: Get spreadsheet ID from google drive list
var spreadsheetId = properties.get('google.spreadsheetId')

var projectName = properties.get('gcp.projectName')

// TODO: Bind accessToken to user session
var gblAccessToken = ""

var strategy = new GoogleStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    if (profile) {
	console.log("gblAccessToken: " + gblAccessToken)
	gblAccessToken = accessToken 
        user = profile;

	// Save refresh token
	console.log("Preparing to save token to datastore [id=" + profile.id + ", token=" + refreshToken + "]")	
	create(profile, refreshToken)

	return done(null, user);
    } else {
        return done(null, false);
    }
  }
)

passport.use(strategy)
refresh.use(strategy)

passport.serializeUser(function(user, done) {
	done(null, user);
})

passport.deserializeUser(function(user, done) {
  done(null, user);
})

var app = express()
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  next()
})
app.use('/tokenstore', tokenmanager);

app.get('/', (req, res) => {
	res.status(200).send('<a href="/auth/google">Sign In with Google</a>')
})

app.get('/private', (req, res) => {
	axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=false`, {
  		headers: {'Authorization': 'Bearer '+gblAccessToken, 'Accept': 'application/json'}
	}).then(function (response) {

		if(response.status === 403) {
			res.status(200).send('Private Page 403<br />Access Token: ' + gblAccessToken + '<br />Message: Oh no! Caught 402 Error')
		} else {
			console.log("*** response: " + JSON.stringify(response.data))
			res.status(200).send('Private Page<br />Access Token: ' + gblAccessToken + '<br />Message: ' + JSON.stringify(response.data))
		}
	}).catch(function (error) {
    		console.log("*** error: " + error);
		//id = get('110836914681755155923')

		// Add condition to check for error to be 403. At the moment assumption is made.
		// Get accessToken via the refresh token
		refresh.requestNewAccessToken('google', googleRefreshToken, function(err, accessToken, googleRefreshToken) {
			listGoogleDrive(accessToken, data => showPage(data, res))
  		})
	})
})

app.get('/private/doc/', (req, res) => {
	axios.get('https://www.googleapis.com/drive/v2/files', {
		headers: { 'Authorization' : 'Bearer ' + gblAccessToken, 'Accept': 'application/json'}
	}).then(response => {
		console.log("*** response: " + JSON.stringify(response.data))
		res.status(200).send('Private Docs <br /> ' + response.data)
	}).catch(err => {
		console.log(err)
		res.status(200).send('Private Docs <br /> ' + err)
	})
})

const showPage = (data, res) => {
	console.log(`*** showPage: ${JSON.stringify(data)}`)
	res.status(200).send(`Private Docs <br /> ${JSON.stringify(data)}`)
}

const listGoogleDrive = (accessToken, callback) => {
	axios.get('https://www.googleapis.com/drive/v2/files', {
		headers: { 'Authorization' : 'Bearer ' + accessToken, 'Accept': 'application/json'}
	}).then(response => {
		console.log("*** response: " + JSON.stringify(response.data))
		callback(response.data)
	}).catch(err => {
		console.log(err)
		return err
	})
}

app.get('/error', (req, res) => {
	res.status(200).send('Error Page')
})

app.get('/auth/google',
  passport.authenticate('google', { scope: [
	'https://www.googleapis.com/auth/plus.login',
	// Spreadsheet permissions
  	'https://www.googleapis.com/auth/drive',
	'https://www.googleapis.com/auth/drive.file',
	'https://www.googleapis.com/auth/drive.readonly',
	'https://www.googleapis.com/auth/spreadsheets',
	'https://www.googleapis.com/auth/spreadsheets.readonly',
	// Drive permissions
	'https://www.googleapis.com/auth/drive',
	'https://www.googleapis.com/auth/drive.appdata',
	'https://www.googleapis.com/auth/drive.apps.readonly',
	'https://www.googleapis.com/auth/drive.file',
	'https://www.googleapis.com/auth/drive.metadata',
	'https://www.googleapis.com/auth/drive.metadata.readonly',
	'https://www.googleapis.com/auth/drive.photos.readonly',
	'https://www.googleapis.com/auth/drive.readonly'
  	],
  	accessType: 'offline', 
	approvalPrompt: 'force' })
)

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/private')
});

app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) })

/*
 * Setup GCP Datastore
 */ 
var datastore = new Datastore({
    projectId: projectName,
  });

// Save refresh token to datastore
const create = (profile, token) => {
  var entity = {
      key: datastore.key('Refresh', profile.id),
      data: {
        id: profile.id,
        token: token
      }
  }

  console.log(`entity: ${JSON.stringify(entity)}`)
  datastore.save(entity, (err) => {
	  console.log("Datastore save [error=" + err + "]")
  })
}

//const get = uid => {
//	const key = datastore.key(['Refresh', uid]);
//	console.log("Search by key [key=" + key + "]")
//	
//	datastore.get(key)
//  	.then(results => {
//    		console.log(results)
//		return results
//  	}).catch(err => { 
//		console.error('ERROR:', err)
//	})
//}
