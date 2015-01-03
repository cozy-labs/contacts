fs = require 'fs'
expect = require('chai').expect

fixtures = require './fixtures/data'
helpers = require './helpers'


describe 'VCF Import/Export', ->

    before helpers.startServer
    before helpers.clearDb
    before helpers.createContact fixtures.contact1

    before helpers.makeTestClient
    after  helpers.killServer


    describe 'Export a single contact', ->

        it 'GET /contacts/:contactid/:fn.vcf', (done) ->

            @client.get "/contacts/#{@contact.id}/james.vcf", done, false


        it 'should return the contact VCF export', (done) ->
            expect(@body).to.equal """
BEGIN:VCARD
VERSION:3.0
NOTE:notes
N:;;;;
FN:John Smith
TEL;TYPE=HOME:+331234567
TEL;TYPE=WORK:12584367
EMAIL;TYPE=HOME:jsmith@test.com
ADR;TYPE=home,postal:;;14 Avenue de la République, 60200 Compiègne, Picardie, France;;;;
END:VCARD

"""
            done()
