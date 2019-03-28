var express = require('express')
    , logger = require('./logger.js')
    , environment = require('./environments')
    , PropertiesReader = require('properties-reader')

var properties = new PropertiesReader(environment)
var projectName = properties.get('gcp.projectName')

var DaoStrategy = require('./dao')
var gcpdatastore = require('./gcpdatastore.js')
var dao = new DaoStrategy(new gcpdatastore(projectName))

var router = express.Router()

router.get('/', (req, res) => {
    replyMessage(res, 200, 'token manager')
})

router.get('/tokens', (req, res) => {
    listToken(data => replyMessage(res, 200, data))
})

router.get('/tokens/:id', (req,res) => {
    findById(req.params.id, data => replyMessage(res, 200, data))
})

router.post('/tokens', (req, res) => {
    let entity = req.body
    logger.info(`Save token [token=${entity}]`)
    create(entity, data => replyMessage(res, 200, data))
})

const replyMessage = (res, statusCode, payload) => {
    res.status(statusCode).json(`{'data': '${payload}'}`)
}

const listToken = (callback) => {
    logger.log('info', 'Request token list.')
    dao.findAll(callback)
}

const findById = (id, callback) => {
    logger.info('info', `Request find by id [id=${id}]`)
    dao.findById(id, callback)
}

const create = (entity, callback) => {
    logger.log('info', `Create entity [entity=${JSON.stringify(entity)}]`)
    dao.create(entity, callback)
}

module.exports = router 
