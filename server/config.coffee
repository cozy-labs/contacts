americano = require 'americano'
fs = require 'fs'
path = require 'path'

root = path.dirname(fs.realpathSync(__filename))
clientPath = path.join root, '..', 'client'
publicPath = path.join clientPath, 'public'

module.exports =

    common:
        use: [
            americano.static path.resolve(__dirname, '../client/public')
            americano.bodyParser()
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
