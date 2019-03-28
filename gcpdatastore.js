var {Datastore} = require('@google-cloud/datastore'),
    logger = require('winston')


var gcpdatastore = function(projectId) {

    // TODO: Should this be a singleton?
    this.datastore = new Datastore({
        projectId: projectId
    })

    this.test = () => {
        logger.log('info', 'gcp cloudstore')
    }

    this.create = (entity, done) => {
        let model = {
            key: this.datastore.key(['Refresh', entity.id]),
            data: {
                token: entity.token
            }
        }
    
        logger.log('info', `entity: ${JSON.stringify(model)}`)
        this.datastore.save(model)
            .then(res => {
                logger.log('info', `{ 'Save' : '${JSON.stringify(res)}' }`)
                done(`{ 'Save' : '${JSON.stringify(res)}' }`)
            }).catch(err => {
                logger.log('info', `{ 'err' : '${JSON.stringify(err)}' }`)
                done(`{ 'Refresh' : '${JSON.stringify(err)}' }`)
            })
    }

    this.findById = (id, done) => {
        logger.log('info', `Request find by id [id=${id}]`)

        let key = this.datastore.key(['Refresh', id])
        this.datastore.get(key)
            .then(res => {
                logger.log('info', `{ 'Refresh' : '${JSON.stringify(res)}' }`)
                done(`{ 'Refresh' : '${JSON.stringify(res)}' }`)
            }).catch(err => {
                logger.log('info', `{ 'err' : '${JSON.stringify(err)}' }`)
                done(`{ 'Refresh' : '${JSON.stringify(err)}' }`)
            })
    }

    this.findAll = (done) => {
        logger.log('info', 'Find by all')

        let query = this.datastore.createQuery('Refresh')
        this.datastore.runQuery(query)
            .then(res => {
                logger.info('info', `{ 'Token list' : '${JSON.stringify(res)}' }`)
                done(`{ 'Token list' : '${JSON.stringify(res)}' }`)
            }).catch(err => {
                logger.info('info', `{ 'err' : '${JSON.stringify(err)}' }`)
                done(`{ 'Token list' : '${JSON.stringify(err)}' }`)
            })
    }
}

module.exports = gcpdatastore
