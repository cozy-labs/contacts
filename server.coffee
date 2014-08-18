americano = require 'americano'
fs = require 'fs'
path = require 'path'

start = (options, callback) ->

    options ?= {}
    options.name = 'Contacts'
    options.port = options.port
    options.host = process.env.HOST or "0.0.0.0"
    options.root = options.root or __dirname

    configPath = path.join process.cwd(), 'config.json'
    unless fs.existsSync configPath
        config = apps: {}
        fs.writeFileSync configPath, JSON.stringify config

    americano.start options, (app, server) ->
        callback null, app, server

if not module.parent
    port = process.env.PORT or 9114
    start {port: port}, (err) ->
        if err
            console.log "Initialization failed, not starting"
            console.log err.stack
            process.exit 1

module.exports.start = start
