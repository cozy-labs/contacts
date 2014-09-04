# See documentation on https://github.com/frankrousseau/americano-cozy/#models

americano = require 'americano'

module.exports = Tasky = americano.getModel 'Tasky',
    'done':
        type: Boolean, default: false
    'creationDate':
        type: Date, default: Date.now
    'completionDate':
        type: Date, default: null
    'description': String
    'order': Number
    'tags': type: JSON
    'isArchived': type: Boolean, default: false
