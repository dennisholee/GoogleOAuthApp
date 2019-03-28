/**
 * @constructor
 */
var DaoStrategy = function(algo) {
    this.algo = algo
}

DaoStrategy.prototype.test = function(done) {
    this.algo.test(done)
}

DaoStrategy.prototype.create = function(entity, done) {
    this.algo.create(entity, done)
}

DaoStrategy.prototype.findAll = function(done) {
    this.algo.findAll(done)
}

DaoStrategy.prototype.findById = function(id, done) {
    this.algo.findById(id, done)
}

module.exports  = DaoStrategy

