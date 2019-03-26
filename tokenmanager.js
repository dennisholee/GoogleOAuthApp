var express = require('express')
var router = express.Router()
var {Datastore} = require('@google-cloud/datastore')
var environment = require('./environments')
var PropertiesReader = require('properties-reader')
var properties = new PropertiesReader(environment)
var projectName = properties.get('gcp.projectName')

var datastore = new Datastore({
    projectId: projectName,
});


router.get("/", (req, res) => {
	replyMessage(res, 200, 'token manager')
})

router.get('/list', (req, res) => {
	listToken(data => replyMessage(res, 200, data))
})

router.get('/token/:id', (req,res) => {
	findById(req.params.id, data => replyMessage(res, 200, data))
})

router.post('/token', (req, res) => {
	entity = req.body
	console.log(`Save token [token=${entity}]`)
	create(entity, data => replyMessage(res, 200, data))
})

const replyMessage = (res, statusCode, payload) => {
	res.status(statusCode).json(`{'data': '${payload}'}`)
}

const listToken = (callback) => {
	console.log('Request token list.')
	query = datastore.createQuery('Refresh')
	datastore.runQuery(query)
	.then(res => {
		console.log(`{ 'Token list' : '${JSON.stringify(res)}' }`)
		callback(`{ 'Token list' : '${JSON.stringify(res)}' }`)
	}).catch(err => {
		console.log(`{ 'err' : '${JSON.stringify(err)}' }`)
		callback(`{ 'Token list' : '${JSON.stringify(err)}' }`)
	})
}

const findById = (id, callback) => {
	console.log(`Request find by id [id=${id}]`)
	key = datastore.key(['Refresh', id])
	datastore.get(key)
	.then(res => {
		console.log(`{ 'Refresh' : '${JSON.stringify(res)}' }`)
		callback(`{ 'Refresh' : '${JSON.stringify(res)}' }`)
	}).catch(err => {
		console.log(`{ 'err' : '${JSON.stringify(err)}' }`)
		callback(`{ 'Refresh' : '${JSON.stringify(err)}' }`)
	})
}


const create = (entity, callback) => {
	var entity = {
		key: datastore.key(['Refresh', entity.id]),
		data: {
			token: entity.token
		}
	}

	console.log(`entity: ${JSON.stringify(entity)}`)
	datastore.save(entity)
	.then(res => {
		console.log(`{ 'Save' : '${JSON.stringify(res)}' }`)
		callback(`{ 'Save' : '${JSON.stringify(res)}' }`)
	}).catch(err => {
		console.log(`{ 'err' : '${JSON.stringify(err)}' }`)
		callback(`{ 'Refresh' : '${JSON.stringify(err)}' }`)
	})
}


module.exports = router 
