contactwatch = require './server/initializers/contactwatch'
path = require 'path'
fs = require 'fs'
americano = require('americano')

start = (options, callback) ->

    options ?= {}
    options.name = 'Contacts'
    options.port ?= 9114
    options.host = process.env.HOST or "0.0.0.0"
    options.root ?=__dirname

    configPath = path.join process.cwd(), 'config.json'
    unless fs.existsSync configPath
        fs.writeFileSync configPath, JSON.stringify {}

    americano.start options, (app, server) ->

        # start contact watch to upadte UI when new contact are added
        # or modified
        #contactwatch server, (err) ->
        callback? null, app, server


if not module.parent
    host = process.env.HOST or '127.0.0.1'
    port = process.env.PORT or 9114
    start {port: port}, (err) ->
        if err
            console.log "Initialization failed, not starting"
            console.log err.stack
            process.exit 1

module.exports.start = start
