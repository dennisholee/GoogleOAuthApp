var cloudstore = require('./gcpdatastore.js')

/**
 * @constructor
 */
var DaoStrategy = function(algo) {
	this.algo = algo
}

DaoStrategy.prototype.test = function(done) {
	console.log('prototype.test')
	this.algo.test()
}

DaoStrategy.prototype.create = function(entity, done) {
}

DaoStrategy.prototype.findById = function(id, done) {
	console.log('prototype.findById')
	this.algo.findById(key, done)
}

module.exports  = DaoStrategy

