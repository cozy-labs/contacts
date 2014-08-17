americano = require 'americano-cozy-pouchdb'
module.exports = Tree = americano.getModel 'Tree',
    type: String
    struct: Object

Tree.all = (params, callback) ->
    Tree.request 'byType', params, callback
