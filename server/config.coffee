americano = require 'americano'
fs = require 'fs'
path = require 'path'

root = path.join path.dirname(fs.realpathSync(__filename))
clientPath = path.join root, '..', 'client'
publicPath = path.join clientPath, 'public'
module.exports =

    common:
        use: [
            americano.static publicPath, maxAge: 86400000
            americano.bodyParser keepExtensions: true
            require('./helpers/shortcut')
            americano.errorHandler
                dumpExceptions: true
                showStack: true
        ]
        set:
            'views': clientPath

    development: [
        americano.logger 'dev'
    ]

    production: [
        americano.logger 'short'
    ]

    plugins: [
        'americano-cozy-pouchdb'
    ]
