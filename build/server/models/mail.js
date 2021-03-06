// Generated by CoffeeScript 1.8.0
var Mail, americano;

americano = require('americano-cozy-pouchdb');

module.exports = Mail = americano.getModel('Mail', {
  createdAt: {
    type: Number,
    "default": 0
  },
  dateValueOf: {
    type: Number,
    "default": 0
  },
  date: {
    type: Date,
    "default": 0
  },
  from: {
    type: String
  },
  cc: {
    type: String
  },
  text: {
    type: String
  },
  html: {
    type: String
  },
  flags: {
    type: Object
  },
  read: {
    type: Boolean,
    "default": false
  },
  flagged: {
    type: Boolean,
    "default": false
  },
  hasAttachments: {
    type: Boolean,
    "default": false
  }
});
