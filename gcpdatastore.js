var {Datastore} = require('@google-cloud/datastore'),
	environment = require('./environments'),
	PropertiesReader = require('properties-reader'),
	properties = new PropertiesReader(environment)

var projectName = properties.get('gcp.projectName')

var gcpdatastore = function(projectId) {

	// TODO: Should this be a singleton?
	this.datastore = new Datastore({
		projectId: projectId
	})

	this.test = () => {
		console.log('gcp cloudstore')
	}

	this.findById = (id, done) => {
		console.log(`Request find by id [id=${id}]`)

		let key = this.datastore.key(['Refresh', id])
        	this.datastore.get(key)
        		.then(res => {
                		console.log(`{ 'Refresh' : '${JSON.stringify(res)}' }`)
                		done(`{ 'Refresh' : '${JSON.stringify(res)}' }`)
        		}).catch(err => {
                		console.log(`{ 'err' : '${JSON.stringify(err)}' }`)
                		done(`{ 'Refresh' : '${JSON.stringify(err)}' }`)
        		})
	}
}

module.exports = gcpdatastore
