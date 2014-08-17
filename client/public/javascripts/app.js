(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
module.exports = {
  initialize: function() {
    var Config, ContactsCollection, ContactsList, Router, e, locales;
    window.app = this;
    this.locale = window.locale;
    delete window.locale;
    this.polyglot = new Polyglot();
    try {
      locales = require('locales/' + this.locale);
    } catch (_error) {
      e = _error;
      locales = require('locales/en');
    }
    this.polyglot.extend(locales);
    window.t = this.polyglot.t.bind(this.polyglot);
    ContactsCollection = require('collections/contact');
    ContactsList = require('views/contactslist');
    Config = require('models/config');
    Router = require('router');
    this.contacts = new ContactsCollection();
    this.contactslist = new ContactsList({
      collection: this.contacts
    });
    this.contactslist.$el.appendTo($('body'));
    this.contactslist.render();
    this.config = new Config(window.config || {});
    delete window.config;
    if (window.initcontacts != null) {
      this.contacts.reset(window.initcontacts, {
        parse: true
      });
      delete window.initcontacts;
    } else {
      this.contacts.fetch();
    }
    this.router = new Router();
    return Backbone.history.start();
  }
};
});

;require.register("collections/contact", function(exports, require, module) {
var ContactCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = ContactCollection = (function(_super) {
  __extends(ContactCollection, _super);

  function ContactCollection() {
    return ContactCollection.__super__.constructor.apply(this, arguments);
  }

  ContactCollection.prototype.model = require('models/contact');

  ContactCollection.prototype.url = 'contacts';

  ContactCollection.prototype.comparator = function(a, b) {
    var nameA, nameB, out;
    nameA = a.getFN().toLowerCase();
    nameB = b.getFN().toLowerCase();
    return out = nameA > nameB ? 1 : nameA < nameB ? -1 : 0;
  };

  ContactCollection.prototype.initialize = function() {
    ContactCollection.__super__.initialize.apply(this, arguments);
    this.on('change:fn', (function(_this) {
      return function() {
        return _this.sort();
      };
    })(this));
    return this.on('change:n', (function(_this) {
      return function() {
        return _this.sort();
      };
    })(this));
  };

  ContactCollection.prototype.getTags = function() {
    var out;
    out = window.tags || [];
    this.each(function(contact) {
      return out = out.concat(contact.get('tags'));
    });
    return _.unique(out);
  };

  return ContactCollection;

})(Backbone.Collection);
});

;require.register("collections/contactlog", function(exports, require, module) {
var ContactLogCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = ContactLogCollection = (function(_super) {
  __extends(ContactLogCollection, _super);

  function ContactLogCollection() {
    return ContactLogCollection.__super__.constructor.apply(this, arguments);
  }

  ContactLogCollection.prototype.model = require('models/contactlog');

  return ContactLogCollection;

})(Backbone.Collection);
});

;require.register("collections/datapoint", function(exports, require, module) {
var DataPointCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = DataPointCollection = (function(_super) {
  __extends(DataPointCollection, _super);

  function DataPointCollection() {
    return DataPointCollection.__super__.constructor.apply(this, arguments);
  }

  DataPointCollection.prototype.model = require('models/datapoint');

  DataPointCollection.prototype.hasOne = function(name, type) {
    var query;
    query = {
      name: name
    };
    if (type) {
      query.type = type;
    }
    return this.where(query).length > 0;
  };

  DataPointCollection.prototype.toJSON = function() {
    var truedps;
    truedps = this.filter(function(model) {
      var value;
      value = model.get('value');
      return (value !== null) && (value !== '') && (value !== ' ');
    });
    return truedps.map(function(model) {
      return model.toJSON();
    });
  };

  DataPointCollection.prototype.prune = function() {
    var toDelete;
    toDelete = [];
    this.each((function(_this) {
      return function(datapoint) {
        var value;
        value = datapoint.get('value');
        if ((value === null) || (value === '') || (value === ' ')) {
          return toDelete.push(datapoint);
        }
      };
    })(this));
    return this.remove(toDelete);
  };

  DataPointCollection.prototype.match = function(filter) {
    return this.any(function(datapoint) {
      return filter.test(datapoint.get('value'));
    });
  };

  return DataPointCollection;

})(Backbone.Collection);
});

;require.register("initialize", function(exports, require, module) {
var app;

app = require('application');

$(function() {
  jQuery.event.props.push('dataTransfer');
  return app.initialize();
});
});

;require.register("initializewidget", function(exports, require, module) {
var app;

app = require('widget');

$(function() {
  jQuery.event.props.push('dataTransfer');
  return app.initialize();
});
});

;require.register("lib/base_view", function(exports, require, module) {
var BaseView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BaseView = (function(_super) {
  __extends(BaseView, _super);

  function BaseView() {
    this.render = __bind(this.render, this);
    return BaseView.__super__.constructor.apply(this, arguments);
  }

  BaseView.prototype.initialize = function(options) {
    return this.options = options;
  };

  BaseView.prototype.template = function() {};

  BaseView.prototype.getRenderData = function() {};

  BaseView.prototype.render = function() {
    var data;
    data = _.extend({}, this.options, this.getRenderData());
    this.$el.html(this.template(data));
    this.afterRender();
    return this;
  };

  BaseView.prototype.afterRender = function() {};

  return BaseView;

})(Backbone.View);
});

;require.register("lib/call_log_reader", function(exports, require, module) {
var directionAlias, isAndroidCallLogExport, isAndroidSMSExport, isIOSCallLogExport, normalizeNumber, parseCSV, parseDuration;

normalizeNumber = require('lib/phone_number');

isAndroidCallLogExport = function(firstline) {
  return firstline === 'date,type,number,name,number type,duration';
};

isAndroidSMSExport = function(firstline) {
  return firstline === 'Date,Time,Type,Number,Name,Message';
};

isIOSCallLogExport = function(firstline) {
  return firstline.split("\t").length === 5;
};

parseDuration = function(duration) {
  var hours, minutes, parts, seconds, _;
  hours = minutes = seconds = 0;
  if ((parts = duration.split(':')).length === 3) {
    hours = parts[0], minutes = parts[1], seconds = parts[2];
  } else {
    switch ((parts = duration.split(' ')).length) {
      case 2:
        seconds = parts[0], _ = parts[1];
        break;
      case 4:
        minutes = parts[0], _ = parts[1], seconds = parts[2], _ = parts[3];
        break;
      case 6:
        hours = parts[0], _ = parts[1], minutes = parts[2], _ = parts[3], seconds = parts[4], _ = parts[5];
    }
  }
  return duration = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
};

parseCSV = function(csv, progress, callback, result, state) {
  var c, field, i, limit, quoted, row;
  if (result == null) {
    result = [[]];
  }
  if (state == null) {
    state = {};
  }
  i = state.i || -1;
  field = state.field || '';
  quoted = state.quoted || false;
  limit = i + 10000;
  row = result.length - 1;
  while (true) {
    i++;
    if (i > limit) {
      return setTimeout(function() {
        progress(i, csv.length);
        return parseCSV(csv, progress, callback, result, {
          i: i - 1,
          field: field,
          quoted: quoted
        });
      }, 10);
    }
    c = csv[i];
    if (c == null) {
      return callback(null, result);
    } else if (c === "\"") {
      if (quoted) {
        if (csv[i + 1] === "\"") {
          field += c;
          i++;
        } else {
          quoted = false;
        }
      } else {
        quoted = true;
      }
    } else if (!quoted && c === ',') {
      result[row].push(field);
      field = '';
    } else if (!quoted && (c === "\r" || c === "\n")) {
      if (field !== '') {
        result[row].push(field);
        row++;
        result[row] = [];
        field = '';
      }
    } else {
      field += c;
    }
  }
};

directionAlias = {
  'in': 'INCOMING',
  'Incoming': 'INCOMING',
  'INCOMING': 'INCOMING',
  'Missed': 'INCOMING',
  'out': 'OUTGOING',
  'Outgoing': 'OUTGOING',
  'OUTGOING': 'OUTGOING'
};

module.exports.parse = function(log, context, callback, progress) {
  var firstline;
  firstline = log.split(/\r?\n/)[0];
  if (isAndroidCallLogExport(firstline)) {
    return parseCSV(log, progress, function(err, parsed) {
      var out;
      parsed.shift();
      parsed.pop();
      out = [];
      parsed.forEach(function(line) {
        var direction, duration, number, timestamp, _;
        timestamp = line[0], direction = line[1], number = line[2], _ = line[3], _ = line[4], duration = line[5];
        direction = directionAlias[direction];
        return out.push({
          type: 'VOICE',
          direction: direction,
          timestamp: Date.create(timestamp).toISOString(),
          remote: {
            tel: normalizeNumber(number, context)
          },
          content: {
            duration: parseDuration(duration)
          }
        });
      });
      return callback(null, out);
    });
  } else if (isAndroidSMSExport(firstline)) {
    return parseCSV(log, progress, function(err, parsed) {
      var out;
      parsed.shift();
      parsed.pop();
      out = [];
      parsed.forEach(function(line) {
        var date, direction, message, number, numbers, time, tstmp, _, _i, _len, _ref, _results;
        date = line[0], time = line[1], direction = line[2], numbers = line[3], _ = line[4], message = line[5];
        tstmp = Date.create(date + 'T' + time + '.000Z').toISOString();
        direction = directionAlias[direction];
        if (!direction) {
          return null;
        }
        _ref = numbers.split(';');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          number = _ref[_i];
          _results.push(out.push({
            type: 'SMS',
            direction: direction,
            timestamp: tstmp,
            remote: {
              tel: normalizeNumber(number, context)
            },
            content: {
              message: message
            }
          }));
        }
        return _results;
      });
      return callback(null, out);
    });
  } else {
    throw new Error("Format not parsable");
  }
};
});

;require.register("lib/phone_number", function(exports, require, module) {
var CODES, db, normalizeNumber;

CODES = db = {};

module.exports = normalizeNumber = function(value, defaultcode) {
  var number;
  number = value.replace(/[- \+]/g, '');
  if (number[0] !== '0') {
    return number;
  } else if (number[1] === 0) {
    return number.substring(2);
  } else {
    return defaultcode + number.substring(1);
  }
};

module.exports.countries = db;

db['Reserved'] = '0';

db['American Samoa'] = '1';

db['Anguilla'] = '1';

db['Antigua and Barbuda'] = '1';

db['Bahamas (Commonwealth of the)'] = '1';

db['Barbados'] = '1';

db['Bermuda'] = '1';

db['British Virgin Islands'] = '1';

db['Canada'] = '1';

db['Cayman Islands'] = '1';

db['Dominica (Commonwealth of)'] = '1';

db['Dominican Republic'] = '1';

db['Grenada'] = '1';

db['Guam'] = '1';

db['Jamaica'] = '1';

db['Montserrat'] = '1';

db['Northern Mariana Islands (Commonwealth of the)'] = '1';

db['Puerto Rico'] = '1';

db['Saint Kitts and Nevis'] = '1';

db['Saint Lucia'] = '1';

db['Saint Vincent and the Grenadines'] = '1';

db['Trinidad and Tobago'] = '1';

db['Turks and Caicos Islands'] = '1';

db['United States of America'] = '1';

db['United States Virgin Islands'] = '1';

db['Egypt (Arab Republic of)'] = '20';

db['Spare code'] = '210';

db['Spare code'] = '211';

db['Morocco (Kingdom of)'] = '212';

db['Algeria (People\'s Democratic Republic of)'] = '213';

db['Spare code'] = '214';

db['Spare code'] = '215';

db['Tunisia'] = '216';

db['Spare code'] = '217';

db['Libya (Socialist People\'s Libyan Arab Jamahiriya)'] = '218';

db['Spare code'] = '219';

db['Gambia (Republic of the)'] = '220';

db['Senegal (Republic of)'] = '221';

db['Mauritania (Islamic Republic of)'] = '222';

db['Mali (Republic of)'] = '223';

db['Guinea (Republic of)'] = '224';

db['Côte d\'Ivoire (Republic of)'] = '225';

db['Burkina Faso'] = '226';

db['Niger (Republic of the)'] = '227';

db['Togolese Republic'] = '228';

db['Benin (Republic of)'] = '229';

db['Mauritius (Republic of)'] = '230';

db['Liberia (Republic of)'] = '231';

db['Sierra Leone'] = '232';

db['Ghana'] = '233';

db['Nigeria (Federal Republic of)'] = '234';

db['Chad (Republic of)'] = '235';

db['Central African Republic'] = '236';

db['Cameroon (Republic of)'] = '237';

db['Cape Verde (Republic of)'] = '238';

db['Sao Tome and Principe (Democratic Republic of)'] = '239';

db['Equatorial Guinea (Republic of)'] = '240';

db['Gabonese Republic'] = '241';

db['Congo (Republic of the)'] = '242';

db['Democratic Republic of the Congo'] = '243';

db['Angola (Republic of)'] = '244';

db['Guinea-Bissau (Republic of)'] = '245';

db['Diego Garcia'] = '246';

db['Ascension'] = '247';

db['Seychelles (Republic of)'] = '248';

db['Sudan (Republic of the)'] = '249';

db['Rwanda (Republic of)'] = '250';

db['Ethiopia (Federal Democratic Republic of)'] = '251';

db['Somali Democratic Republic'] = '252';

db['Djibouti (Republic of)'] = '253';

db['Kenya (Republic of)'] = '254';

db['Tanzania (United Republic of)'] = '255';

db['Uganda (Republic of)'] = '256';

db['Burundi (Republic of)'] = '257';

db['Mozambique (Republic of)'] = '258';

db['Spare code'] = '259';

db['Zambia (Republic of)'] = '260';

db['Madagascar (Republic of)'] = '261';

db['French Departments and Territories in the Indian Ocean j'] = '262';

db['Zimbabwe (Republic of)'] = '263';

db['Namibia (Republic of)'] = '264';

db['Malawi'] = '265';

db['Lesotho (Kingdom of)'] = '266';

db['Botswana (Republic of)'] = '267';

db['Swaziland (Kingdom of)'] = '268';

db['Comoros (Union of the)'] = '269';

db['Mayotte'] = '269';

db['South Africa (Republic of)'] = '27';

db['Spare code'] = '280';

db['Spare code'] = '281';

db['Spare code'] = '282';

db['Spare code'] = '283';

db['Spare code'] = '284';

db['Spare code'] = '285';

db['Spare code'] = '286';

db['Spare code'] = '287';

db['Spare code'] = '288';

db['Spare code'] = '289';

db['Saint Helena'] = '290';

db['Tristan da Cunha'] = '290';

db['Eritrea'] = '291';

db['Spare code'] = '292';

db['Spare code'] = '293';

db['Spare code'] = '294';

db['Spare code'] = '295';

db['Spare code'] = '296';

db['Aruba'] = '297';

db['Faroe Islands'] = '298';

db['Greenland (Denmark)'] = '299';

db['Greece'] = '30';

db['Netherlands (Kingdom of the)'] = '31';

db['Belgium'] = '32';

db['France'] = '33';

db['Spain'] = '34';

db['Gibraltar'] = '350';

db['Portugal'] = '351';

db['Luxembourg'] = '352';

db['Ireland'] = '353';

db['Iceland'] = '354';

db['Albania (Republic of)'] = '355';

db['Malta'] = '356';

db['Cyprus (Republic of)'] = '357';

db['Finland'] = '358';

db['Bulgaria (Republic of)'] = '359';

db['Hungary (Republic of)'] = '36';

db['Lithuania (Republic of)'] = '370';

db['Latvia (Republic of)'] = '371';

db['Estonia (Republic of)'] = '372';

db['Moldova (Republic of)'] = '373';

db['Armenia (Republic of)'] = '374';

db['Belarus (Republic of)'] = '375';

db['Andorra (Principality of)'] = '376';

db['Monaco (Principality of)'] = '377';

db['San Marino (Republic of)'] = '378';

db['Vatican City State f'] = '379';

db['Ukraine'] = '380';

db['Serbia (Republic of)'] = '381';

db['Montenegro (Republic of)'] = '382';

db['Spare code'] = '383';

db['Spare code'] = '384';

db['Croatia (Republic of)'] = '385';

db['Slovenia (Republic of)'] = '386';

db['Bosnia and Herzegovina'] = '387';

db['Group of countries, shared code'] = '388';

db['The Former Yugoslav Republic of Macedonia'] = '389';

db['Italy'] = '39';

db['Vatican City State'] = '39';

db['Romania'] = '40';

db['Switzerland (Confederation of)'] = '41';

db['Czech Republic'] = '420';

db['Slovak Republic'] = '421';

db['Spare code'] = '422';

db['Liechtenstein (Principality of)'] = '423';

db['Spare code'] = '424';

db['Spare code'] = '425';

db['Spare code'] = '426';

db['Spare code'] = '427';

db['Spare code'] = '428';

db['Spare code'] = '429';

db['Austria'] = '43';

db['United Kingdom of Great Britain and Northern Ireland'] = '44';

db['Denmark'] = '45';

db['Sweden'] = '46';

db['Norway'] = '47';

db['Poland (Republic of)'] = '48';

db['Germany (Federal Republic of)'] = '49';

db['Falkland Islands (Malvinas)'] = '500';

db['Belize'] = '501';

db['Guatemala (Republic of)'] = '502';

db['El Salvador (Republic of)'] = '503';

db['Honduras (Republic of)'] = '504';

db['Nicaragua'] = '505';

db['Costa Rica'] = '506';

db['Panama (Republic of)'] = '507';

db['Saint Pierre and Miquelon'] = '508';

db['Haiti (Republic of)'] = '509';

db['Peru'] = '51';

db['Mexico'] = '52';

db['Cuba'] = '53';

db['Argentine Republic'] = '54';

db['Brazil (Federative Republic of)'] = '55';

db['Chile'] = '56';

db['Colombia (Republic of)'] = '57';

db['Venezuela (Bolivarian Republic of)'] = '58';

db['Guadeloupe (French Department of)'] = '590';

db['Bolivia (Republic of)'] = '591';

db['Guyana'] = '592';

db['Ecuador'] = '593';

db['French Guiana (French Department of)'] = '594';

db['Paraguay (Republic of)'] = '595';

db['Martinique (French Department of)'] = '596';

db['Suriname (Republic of)'] = '597';

db['Uruguay (Eastern Republic of)'] = '598';

db['Netherlands Antilles'] = '599';

db['Malaysia'] = '60';

db['Australia i'] = '61';

db['Indonesia (Republic of)'] = '62';

db['Philippines (Republic of the)'] = '63';

db['New Zealand'] = '64';

db['Singapore (Republic of)'] = '65';

db['Thailand'] = '66';

db['Democratic Republic of Timor-Leste'] = '670';

db['Spare code'] = '671';

db['Australian External Territories g'] = '672';

db['Brunei Darussalam'] = '673';

db['Nauru (Republic of)'] = '674';

db['Papua New Guinea'] = '675';

db['Tonga (Kingdom of)'] = '676';

db['Solomon Islands'] = '677';

db['Vanuatu (Republic of)'] = '678';

db['Fiji (Republic of)'] = '679';

db['Palau (Republic of)'] = '680';

db['Wallis and Futuna'] = '681';

db['Cook Islands'] = '682';

db['Niue'] = '683';

db['Spare code'] = '684';

db['Samoa (Independent State of)'] = '685';

db['Kiribati (Republic of)'] = '686';

db['New Caledonia'] = '687';

db['Tuvalu'] = '688';

db['French Polynesia'] = '689';

db['Tokelau'] = '690';

db['Micronesia (Federated States of)'] = '691';

db['Marshall Islands (Republic of the)'] = '692';

db['Spare code'] = '693';

db['Spare code'] = '694';

db['Spare code'] = '695';

db['Spare code'] = '696';

db['Spare code'] = '697';

db['Spare code'] = '698';

db['Spare code'] = '699';

db['Kazakhstan (Republic of)'] = '7';

db['Russian Federation'] = '7';

db['International Freephone Service'] = '800';

db['Spare code'] = '801';

db['Spare code'] = '802';

db['Spare code'] = '803';

db['Spare code'] = '804';

db['Spare code'] = '805';

db['Spare code'] = '806';

db['Spare code'] = '807';

db['International Shared Cost Service (ISCS)'] = '808';

db['Spare code'] = '809';

db['Japan'] = '81';

db['Korea (Republic of)'] = '82';

db['Spare code'] = '830';

db['Spare code'] = '831';

db['Spare code'] = '832';

db['Spare code'] = '833';

db['Spare code'] = '834';

db['Spare code'] = '835';

db['Spare code'] = '836';

db['Spare code'] = '837';

db['Spare code'] = '838';

db['Spare code'] = '839';

db['Viet Nam (Socialist Republic of)'] = '84';

db['Democratic People\'s Republic of Korea'] = '850';

db['Spare code'] = '851';

db['Hong Kong, China'] = '852';

db['Macao, China'] = '853';

db['Spare code'] = '854';

db['Cambodia (Kingdom of)'] = '855';

db['Lao People\'s Democratic Republic'] = '856';

db['Spare code'] = '857';

db['Spare code'] = '858';

db['Spare code'] = '859';

db['China (People\'s Republic of)'] = '86';

db['Inmarsat SNAC'] = '870';

db['Spare code'] = '871';

db['Spare code'] = '872';

db['Spare code'] = '873';

db['Spare code'] = '874';

db['Reserved - Maritime Mobile Service Applications'] = '875';

db['Reserved - Maritime Mobile Service Applications'] = '876';

db['Reserved - Maritime Mobile Service Applications'] = '877';

db['Universal Personal Telecommunication Service (UPT) e'] = '878';

db['Reserved for national non-commercial purposes'] = '879';

db['Bangladesh (People\'s Republic of)'] = '880';

db['Global Mobile Satellite System (GMSS), shared code n'] = '881';

db['International Networks, shared code o'] = '882';

db['International Networks, shared code p, q'] = '883';

db['Spare code'] = '884';

db['Spare code'] = '885';

db['Taiwan, China'] = '886';

db['Spare code'] = '887';

db['Telecommunications for Disaster Relief (TDR) k'] = '888';

db['Spare code'] = '889';

db['Spare code'] = '890';

db['Spare code'] = '891';

db['Spare code'] = '892';

db['Spare code'] = '893';

db['Spare code'] = '894';

db['Spare code'] = '895';

db['Spare code'] = '896';

db['Spare code'] = '897';

db['Spare code'] = '898';

db['Spare code'] = '899';

db['Turkey'] = '90';

db['India (Republic of)'] = '91';

db['Pakistan (Islamic Republic of)'] = '92';

db['Afghanistan'] = '93';

db['Sri Lanka (Democratic Socialist Republic of)'] = '94';

db['Myanmar (Union of)'] = '95';

db['Maldives (Republic of)'] = '960';

db['Lebanon'] = '961';

db['Jordan (Hashemite Kingdom of)'] = '962';

db['Syrian Arab Republic'] = '963';

db['Iraq (Republic of)'] = '964';

db['Kuwait (State of)'] = '965';

db['Saudi Arabia (Kingdom of)'] = '966';

db['Yemen (Republic of)'] = '967';

db['Oman (Sultanate of)'] = '968';

db['Reserved - reservation currently under investigation'] = '969';

db['Reserved l'] = '970';

db['United Arab Emirates h'] = '971';

db['Israel (State of)'] = '972';

db['Bahrain (Kingdom of)'] = '973';

db['Qatar (State of)'] = '974';

db['Bhutan (Kingdom of)'] = '975';

db['Mongolia'] = '976';

db['Nepal (Federal Democratic Republic of)'] = '977';

db['Spare code'] = '978';

db['International Premium Rate Service (IPRS)'] = '979';

db['Iran (Islamic Republic of)'] = '98';

db['Spare code'] = '990';

db['Trial of a proposed new international telecommunication public'] = '991';

db['Tajikistan (Republic of)'] = '992';

db['Turkmenistan'] = '993';

db['Azerbaijani Republic'] = '994';

db['Georgia'] = '995';

db['Kyrgyz Republic'] = '996';

db['Spare code'] = '997';

db['Uzbekistan (Republic of)'] = '998';

db['Reserved for future global service'] = '999';
});

;require.register("lib/request", function(exports, require, module) {
exports.request = function(type, url, data, callback) {
  return $.ajax({
    type: type,
    url: url,
    data: data != null ? JSON.stringify(data) : null,
    contentType: "application/json",
    dataType: "json",
    success: function(data) {
      if (callback != null) {
        return callback(null, data);
      }
    },
    error: function(data) {
      if ((data != null) && (data.msg != null) && (callback != null)) {
        return callback(new Error(data.msg));
      } else if (callback != null) {
        return callback(new Error("Server error occured"));
      }
    }
  });
};

exports.get = function(url, callback) {
  return exports.request("GET", url, null, callback);
};

exports.post = function(url, data, callback) {
  return exports.request("POST", url, data, callback);
};

exports.put = function(url, data, callback) {
  return exports.request("PUT", url, data, callback);
};

exports.del = function(url, callback) {
  return exports.request("DELETE", url, null, callback);
};
});

;require.register("lib/view_collection", function(exports, require, module) {
var BaseView, ViewCollection,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

module.exports = ViewCollection = (function(_super) {
  __extends(ViewCollection, _super);

  function ViewCollection() {
    this.removeItem = __bind(this.removeItem, this);
    this.addItem = __bind(this.addItem, this);
    return ViewCollection.__super__.constructor.apply(this, arguments);
  }

  ViewCollection.prototype.views = {};

  ViewCollection.prototype.itemView = null;

  ViewCollection.prototype.itemViewOptions = function() {};

  ViewCollection.prototype.checkIfEmpty = function() {
    return this.$el.toggleClass('empty', _.size(this.views) === 0);
  };

  ViewCollection.prototype.appendView = function(view) {
    return this.$el.append(view.el);
  };

  ViewCollection.prototype.initialize = function() {
    ViewCollection.__super__.initialize.apply(this, arguments);
    this.views = {};
    this.listenTo(this.collection, "reset", this.onReset);
    this.listenTo(this.collection, "add", this.addItem);
    this.listenTo(this.collection, "remove", this.removeItem);
    this.listenTo(this.collection, "sort", this.onReset);
    return this.onReset(this.collection);
  };

  ViewCollection.prototype.render = function() {
    var id, view, _ref;
    _ref = this.views;
    for (id in _ref) {
      view = _ref[id];
      view.$el.detach();
    }
    return ViewCollection.__super__.render.apply(this, arguments);
  };

  ViewCollection.prototype.afterRender = function() {
    var id, view, _ref;
    _ref = this.views;
    for (id in _ref) {
      view = _ref[id];
      this.appendView(view);
    }
    return this.checkIfEmpty(this.views);
  };

  ViewCollection.prototype.remove = function() {
    this.onReset([]);
    return ViewCollection.__super__.remove.apply(this, arguments);
  };

  ViewCollection.prototype.onReset = function(newcollection) {
    var id, view, _ref;
    _ref = this.views;
    for (id in _ref) {
      view = _ref[id];
      view.remove();
    }
    return newcollection.forEach(this.addItem);
  };

  ViewCollection.prototype.addItem = function(model) {
    var options, view;
    options = _.extend({}, {
      model: model
    }, this.itemViewOptions(model));
    view = new this.itemView(options);
    this.views[model.cid] = view.render();
    this.appendView(view);
    return this.checkIfEmpty(this.views);
  };

  ViewCollection.prototype.removeItem = function(model) {
    this.views[model.cid].remove();
    delete this.views[model.cid];
    return this.checkIfEmpty(this.views);
  };

  return ViewCollection;

})(BaseView);
});

;require.register("locales/en", function(exports, require, module) {
module.exports = {
  "saving": "Saving ...",
  "saved": "Saved",
  "delete": "Delete",
  "delete contact": "Delete the contact permanently",
  "add contact": "Create a new contact",
  "company": "Company",
  "title": "Title",
  "birthday": "Birthday",
  "phone": "Phone",
  "skype": "Skype",
  "email": "Email",
  "postal": "Postal",
  "url": "Url",
  "other": "Other",
  "add": "Add",
  "notes": "Notes",
  "about": "About",
  "name": "Name",
  "change": "Change",
  "notes placeholder": "Take notes here",
  "type here": "Type here",
  "phones": "Phones",
  "emails": "Emails",
  "postal": "Postal",
  "links": "Links",
  "others": "Others",
  "actions": "Actions",
  "add fields": "Add fields",
  "more options": "More options",
  "save changes alert": "Save changes ?",
  "not an image": "This is not an image",
  "remove datapoint": "Remove",
  "changes saved": "Changes saved",
  "undo": "Undo",
  "undone": "Undone",
  "history": "History",
  "info": "Info",
  "cozy url": "Cozy",
  "twitter": "Twitter",
  "add tags": "add tags",
  "add note": "Add a note",
  "duration": "Duration",
  "seconds": "s",
  "minutes": "min",
  "hours": "h",
  "you called": "You called",
  "you were called": "You were called",
  "create call task": "Create contact task",
  "creating...": "creating...",
  "edit name": "Edit Name",
  "name editor": "Name Editor",
  "prefix": "Prefix",
  "placeholder prefix": "Sir",
  "first name": "Given Name",
  "placeholder first": "John",
  "middle name": "Middel Name",
  "placeholder middle": "D.",
  "last name": "Familly Name",
  "placeholder last": "Doe",
  "suffix": "Suffix",
  "placeholder suffix": "III",
  "full name": "Full name",
  "save": "Save",
  "search placeholder": "Search ...",
  "new contact": "New Contact",
  "go to settings": "Settings",
  "choose vcard file": "Choose a vCard file",
  "is not a vcard": "is not a vCard",
  "cancel": "Cancel",
  "import": "Import",
  "import call log help": "If you are a FING and Orange user, do not use this",
  "choose log file": "Then upload your generated log file",
  "import ios calls": "Support for iOS is not available yet. If you want to contribute, have a look at ",
  "import.ready-msg": "Ready to import %{smart_count} contact ||||\nReady to import %{smart_count} contacts",
  "import android calls": "If you use an android phone, use the following application to import your calls: ",
  "import android sms": "If you use an android phone, use the following application to import your sms: ",
  "choose phone country": "Choose the country of the phone",
  "ready to import": "Ready to import",
  "log direction": "Direction",
  "log number": "Number",
  "log date": "Date",
  "importing this file": "We are importing this file",
  "may take a while": "It may take a while",
  "progress": "Progress",
  "click left to display": "Browse: Click on a contact in the left panel to display it.",
  "import export": "Import / Export",
  "call log info": "Click here to import your mobile's call log:",
  "import call log": "Import call Log",
  "vcard import info": "Click here to import a vCard file:",
  "import vcard": "Import vCard",
  "export all vcard": "Export vCard file",
  "export vcard": "Export vCard file",
  "settings": "Settings",
  "help": "Help",
  "name format info": "Select display name format (will not change contacts already imported)",
  "format given familly": "Given Familly (John Johnson)",
  "format familly given": "Name, First name (Johnson John)",
  "format given mid familly": "Full (John J. Johnson)",
  "do this now": "Select the format your contacts have now.",
  "vcard export info": "Click here to export all your contacts as a vCard file:",
  "carddav info": "Synchronization: To sync your contacts with your mobile, install the Webdav\napplication from the market place.",
  "search info": "Search: Use the search field located on the top left\ncorner to perform a search on all the fields of your contacts. If you\ntype a tag name, results will contain all people tagged with it.",
  "creation info": "Creation: Click on the plus button located aside the search field to\ndisplay a new contact page. Fill the name field and your contact will\nbe created."
};
});

;require.register("locales/fr", function(exports, require, module) {
module.exports = {
  "saving": "Sauvegarde ...",
  "saved": "Sauvegardé",
  "delete": "Supprimer",
  "delete contact": "Supprimer le contact",
  "add contact": "Créer un contact",
  "company": "Société",
  "title": "Titre",
  "birthday": "Anniversaire",
  "phone": "Telephone",
  "skype": "Skype",
  "email": "Email",
  "postal": "Adresse",
  "url": "Url",
  "other": "Autre",
  "add": "Ajouter",
  "notes": "Notes",
  "about": "A propos",
  "name": "Nom",
  "change": "Changer",
  "notes placeholder": "Prenez des notes ici",
  "type here": "Tapez ici",
  "phones": "Telephones",
  "emails": "Emails",
  "postal": "Adresses",
  "links": "Liens",
  "others": "Autres",
  "actions": "Actions",
  "add fields": "Ajouter des champs",
  "more options": "Plus d'options",
  "save changes alert": "Sauvegarder ?",
  "not an image": "Ceci n'est pas une image",
  "remove datapoint": "Enlever",
  "changes saved": "Changements sauvegardés",
  "undo": "Annuler",
  "undone": "Annulé",
  "history": "Historique",
  "info": "Info",
  "cozy url": "Cozy",
  "twitter": "Twitter",
  "add tags": "Ajouter des tags",
  "add note": "Ajouter une une note",
  "duration": "Durée",
  "seconds": "s",
  "minutes": "min",
  "hours": "h",
  "you called": "Vous avez appelé",
  "you were called": "Vous avez été appelé",
  "create call task": "Créer une tâche de contact",
  "creating...": "en création...",
  "edit name": "Modifier le nom",
  "name editor": "Editeur de nom",
  "prefix": "Préfixe",
  "placeholder prefix": "M.",
  "first name": "Prénom courant",
  "placeholder first": "Pierre",
  "middle name": "Autres prénoms",
  "placeholder middle": "Marie Jacque",
  "last name": "Nom",
  "placeholder last": "Dupont",
  "suffix": "Suffixe",
  "placeholder suffix": "III",
  "full name": "Nom complet",
  "save": "Enregister",
  "search placeholder": "Recherche ...",
  "new contact": "Nouveau Contact",
  "go to settings": "Paramètres",
  "choose vcard file": "Choisissez un fichier vCard",
  "is not a vcard": "n'est pas un fichier vCard",
  "cancel": "Annuler",
  "import": "Importer",
  "import call log help": "N'utilisez pas cette fonction si vous êtes un client FING/Orange",
  "choose log file": "Puis uploadez le fichier que vous avez généré",
  "import ios calls": "Pas de support pour iOS pour le moment. Pour contribuer, rendez vous sur ",
  "import.ready-msg": "Prêt à importer %{smart_count} contact ||||\nPrêt à importer %{smart_count} contacts",
  "import android calls": "Si vous utilisez un téléphone Android, utilisez cette application pour importer vos appels : ",
  "import android sms": "Si vous utilisez un téléphone Android, utilisez cette application pour importer vos sms : ",
  "choose phone country": "Choisissez le pays de ce téléphone",
  "ready to import": "Prêt à l'import",
  "log direction": "Direction",
  "log number": "Number",
  "log date": "Date",
  "importing this file": "Nous importons ce fichier",
  "may take a while": "Cela peut prendre quelques minutes",
  "progress": "Progression",
  "click left to display": "Navigation: cliquez sur un contact dans le panneau de gauche pour l'afficher",
  "import export": "Import / Export",
  "call log info": "Cliquez ici pour importer votre historique mobile :",
  "import call log": "Importer l'historique",
  "vcard import info": "Cliquez ici pour importer vos contacts :",
  "import vcard": "Importer vCard",
  "export all vcard": "Exporter un fichier vCard",
  "export vcard": "Exporter un fichier vCard file",
  "settings": "Paramètres",
  "help": "Aide",
  "name format info": "Selectionnez le format d'affichage des noms (Cela n'influera pas les contacts déjà importés)",
  "format given familly": "Prénom Nom (Pierre Dupont)",
  "format familly given": "Nom Prénom (Dupont Pierre)",
  "format given mid familly": "Format américain (John J. Johnson)",
  "do this now": "Indiquez le format qu'ont actuellement vos contacts.",
  "vcard export info": "Cliquez ici pour exporter tous vos contacts dans un fichier vCard :",
  "carddav info": "Synchronization : Pour synchroniser vos contacts sur votre mobile,\ninstallez l'application Webdav depuis le market place.",
  "search info": "Recherche : utilisez le champ situé en haut à gauche pour effectuer\nune recherche sur tous les champs de contacts. Si vous tapez un nom de tag,\nil affichera tous les contacts taggés avec celui ci.",
  "creation info": "Création : Cliquez sur le bouton plus situé à côté du champ de recherche\npour afficher une nouvelle page de contact. Donnez un nom au contact pour\nqu'il soit sauvegardé."
};
});

;require.register("models/config", function(exports, require, module) {
var Config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Config = (function(_super) {
  __extends(Config, _super);

  function Config() {
    return Config.__super__.constructor.apply(this, arguments);
  }

  Config.prototype.url = 'config';

  Config.prototype.isNew = function() {
    return true;
  };

  Config.prototype.defaults = {
    'nameOrder': 'given-familly'
  };

  return Config;

})(Backbone.Model);
});

;require.register("models/contact", function(exports, require, module) {
var ANDROID_RELATION_TYPES, AndroidToDP, Contact, ContactLogCollection, DataPoint, DataPointCollection, request,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

request = require('lib/request');

DataPoint = require('models/datapoint');

DataPointCollection = require('collections/datapoint');

ContactLogCollection = require('collections/contactlog');

ANDROID_RELATION_TYPES = ['custom', 'assistant', 'brother', 'child', 'domestic partner', 'father', 'friend', 'manager', 'mother', 'parent', 'partner', 'referred by', 'relative', 'sister', 'spouse'];

module.exports = Contact = (function(_super) {
  var initial;

  __extends(Contact, _super);

  Contact.prototype.urlRoot = 'contacts';

  function Contact() {
    this.match = __bind(this.match, this);
    this.addDP = __bind(this.addDP, this);
    this.dataPoints = new DataPointCollection();
    Contact.__super__.constructor.apply(this, arguments);
  }

  Contact.prototype.initialize = function() {
    this.on('change:datapoints', (function(_this) {
      return function() {
        var dps;
        dps = _this.get('datapoints');
        if (dps) {
          _this.dataPoints.reset(dps);
          return _this.set('datapoints', null);
        }
      };
    })(this));
    this.history = new ContactLogCollection;
    this.history.url = this.url() + '/logs';
    return this.on('change:id', (function(_this) {
      return function() {
        return _this.history.url = _this.url() + '/logs';
      };
    })(this));
  };

  Contact.prototype.defaults = function() {
    return {
      note: '',
      tags: []
    };
  };

  Contact.prototype.parse = function(attrs) {
    var _ref;
    if (_.where(attrs != null ? attrs.datapoints : void 0, {
      name: 'tel'
    }).length === 0) {
      if (attrs != null) {
        attrs.datapoints.push({
          name: 'tel',
          type: 'main',
          value: ''
        });
      }
    }
    if (_.where(attrs != null ? attrs.datapoints : void 0, {
      name: 'email'
    }).length === 0) {
      if (attrs != null) {
        attrs.datapoints.push({
          name: 'email',
          type: 'main',
          value: ''
        });
      }
    }
    if (attrs.datapoints) {
      this.dataPoints.reset(attrs.datapoints);
      delete attrs.datapoints;
    }
    if ((_ref = attrs._attachments) != null ? _ref.picture : void 0) {
      this.hasPicture = true;
      delete attrs._attachments;
    }
    if (typeof attrs.n === 'string') {
      attrs.n = attrs.n.split(';');
    }
    if (!Array.isArray(attrs.n)) {
      attrs.n = void 0;
    }
    return attrs;
  };

  Contact.prototype.sync = function(method, model, options) {
    var success;
    if (this.picture) {
      options.contentType = false;
      options.data = new FormData();
      options.data.append('picture', this.picture);
      options.data.append('contact', JSON.stringify(this.toJSON()));
      success = options.success;
      options.success = (function(_this) {
        return function(resp) {
          success(resp);
          _this.hasPicture = true;
          _this.trigger('change', _this, {});
          return delete _this.picture;
        };
      })(this);
    }
    return Contact.__super__.sync.call(this, method, model, options);
  };

  Contact.prototype.getBest = function(name) {
    var result, _ref;
    result = null;
    this.dataPoints.each(function(dp) {
      if (dp.get('name') === name) {
        if (dp.get('pref')) {
          return result = dp.get('value');
        } else {
          return result != null ? result : result = dp.get('value');
        }
      }
    });
    if (typeof attrs !== "undefined" && attrs !== null) {
      attrs.addDP('mail', 'main', '');
    }
    if (attrs.datapoints) {
      this.dataPoints.reset(attrs.datapoints);
      delete attrs.datapoints;
    }
    if ((_ref = attrs._attachments) != null ? _ref.picture : void 0) {
      this.hasPicture = true;
      delete attrs._attachments;
    }
    if (typeof attrs.n === 'string') {
      attrs.n = attrs.n.split(';');
    }
    if (!Array.isArray(attrs.n)) {
      attrs.n = void 0;
    }
    return attrs;
  };

  Contact.prototype.sync = function(method, model, options) {
    var success;
    if (this.picture) {
      options.contentType = false;
      options.data = new FormData();
      options.data.append('picture', this.picture);
      options.data.append('contact', JSON.stringify(this.toJSON()));
      success = options.success;
      options.success = (function(_this) {
        return function(resp) {
          success(resp);
          _this.hasPicture = true;
          _this.trigger('change', _this, {});
          return delete _this.picture;
        };
      })(this);
    }
    return Contact.__super__.sync.call(this, method, model, options);
  };

  Contact.prototype.getBest = function(name) {
    var result;
    result = null;
    this.dataPoints.each(function(dp) {
      if (dp.get('name') === name) {
        if (dp.get('pref')) {
          return result = dp.get('value');
        } else {
          return result != null ? result : result = dp.get('value');
        }
      }
    });
    return result;
  };

  Contact.prototype.addDP = function(name, type, value) {
    return this.dataPoints.add({
      type: type,
      name: name,
      value: value
    });
  };

  Contact.prototype.match = function(filter) {
    return filter.test(this.get('n')) || filter.test(this.get('fn')) || filter.test(this.get('note')) || filter.test(this.get('tags').join(' ')) || this.dataPoints.match(filter);
  };

  Contact.prototype.toJSON = function() {
    var json;
    json = Contact.__super__.toJSON.apply(this, arguments);
    json.datapoints = this.dataPoints.toJSON();
    if (Array.isArray(json.n)) {
      json.n = json.n.join(';');
    }
    if (!json.n) {
      delete json.n;
    }
    delete json.picture;
    return json;
  };

  Contact.prototype.setFN = function(value) {
    if (this.has('n')) {
      this.set('n', this.getComputedN(value));
      return this.set('fn', '');
    } else {
      return this.set('fn', value);
    }
  };

  Contact.prototype.getFN = function() {
    return this.get('fn') || this.getComputedFN();
  };

  initial = function(middle) {
    var i, _ref;
    if (i = (_ref = middle.split(/[ \,]/)[0][0]) != null ? _ref.toUpperCase() : void 0) {
      return i + '.';
    } else {
      return '';
    }
  };

  Contact.prototype.getComputedFN = function(n) {
    var familly, given, middle, prefix, suffix, _ref;
    if (n == null) {
      n = this.get('n');
    }
    if (!(n && n.length > 0)) {
      return '';
    }
    _ref = n || this.get('n'), familly = _ref[0], given = _ref[1], middle = _ref[2], prefix = _ref[3], suffix = _ref[4];
    switch (app.config.get('nameOrder')) {
      case 'given-familly':
        return "" + given + " " + middle + " " + familly;
      case 'given-middleinitial-familly':
        return "" + given + " " + (initial(middle)) + " " + familly;
      default:
        return "" + familly + ", " + given + " " + middle;
    }
  };

  Contact.prototype.getComputedN = function(fn) {
    var familly, given, middle, parts, prefix, suffix;
    familly = given = middle = prefix = suffix = "";
    if (fn == null) {
      fn = this.get('fn');
    }
    parts = fn.split(/[ \,]/).filter(function(part) {
      return part !== "";
    });
    switch (app.config.get('nameOrder')) {
      case 'given-familly':
      case 'given-middleinitial-familly':
        given = parts[0];
        familly = parts[parts.length - 1];
        middle = parts.slice(1, +(parts.length - 2) + 1 || 9e9).join(' ');
        break;
      case 'familly-given':
        familly = parts[0];
        given = parts[1];
        middle = parts.slice(2).join(' ');
    }
    return [familly, given, middle, prefix, suffix];
  };

  Contact.prototype.createTask = function(callback) {
    return request.post("contacts/" + this.id + "/new-call-task", {}, callback);
  };

  return Contact;

})(Backbone.Model);

AndroidToDP = function(contact, raw) {
  var parts, type, value, _ref;
  parts = raw.split(';');
  switch (parts[0].replace('vnd.android.cursor.item/', '')) {
    case 'contact_event':
      value = parts[1];
      type = (_ref = parts[2]) === '0' || _ref === '2' ? parts[3] : parts[2] === '1' ? 'anniversary' : 'birthday';
      return contact.addDP('about', type, value);
    case 'relation':
      value = parts[1];
      type = ANDROID_RELATION_TYPES[+parts[2]];
      if (type === 'custom') {
        type = parts[3];
      }
      return contact.addDP('other', type, value);
  }
};

Contact.fromVCF = function(vcf) {
  var ContactCollection, all, current, currentdp, currentidx, currentversion, imported, itemidx, key, line, match, part, pname, properties, property, pvalue, regexps, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
  regexps = {
    begin: /^BEGIN:VCARD$/i,
    end: /^END:VCARD$/i,
    simple: /^(version|fn|n|title|org|note)\:(.+)$/i,
    android: /^x-android-custom\:(.+)$/i,
    composedkey: /^item(\d{1,2})\.([^\:]+):(.+)$/,
    complex: /^([^\:\;]+);([^\:]+)\:(.+)$/,
    property: /^(.+)=(.+)$/
  };
  ContactCollection = require('collections/contact');
  imported = new ContactCollection();
  currentversion = "3.0";
  current = null;
  currentidx = null;
  currentdp = null;
  _ref = vcf.split(/\r?\n/);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    line = _ref[_i];
    if (regexps.begin.test(line)) {
      current = new Contact();
    } else if (regexps.end.test(line)) {
      if (currentdp) {
        current.dataPoints.add(currentdp);
      }
      imported.add(current);
      if (current.has('n')) {
        current.unset('fn');
      }
      currentdp = null;
      current = null;
      currentidx = null;
      currentversion = "3.0";
    } else if (regexps.simple.test(line)) {
      _ref1 = line.match(regexps.simple), all = _ref1[0], key = _ref1[1], value = _ref1[2];
      key = key.toLowerCase();
      switch (key) {
        case 'version':
          currentversion = value;
          break;
        case 'title':
        case 'org':
          current.addDP('about', key, value);
          break;
        case 'fn':
        case 'note':
          current.set(key, value);
          break;
        case 'n':
          current.set(key, value.split(';'));
          break;
        case 'bday':
          current.addDP('about', 'birthday', value);
      }
    } else if (regexps.android.test(line)) {
      _ref2 = line.match(regexps.android), all = _ref2[0], value = _ref2[1];
      AndroidToDP(current, value);
    } else if (regexps.composedkey.test(line)) {
      _ref3 = line.match(regexps.composedkey), all = _ref3[0], itemidx = _ref3[1], part = _ref3[2], value = _ref3[3];
      if (currentidx === null || currentidx !== itemidx) {
        if (currentdp) {
          current.dataPoints.add(currentdp);
        }
        currentdp = new DataPoint();
      }
      currentidx = itemidx;
      part = part.split(';');
      key = part[0];
      properties = part.splice(1);
      value = value.split(';');
      if (value.length === 1) {
        value = value[0];
      }
      key = key.toLowerCase();
      if (key === 'x-ablabel' || key === 'x-abadr') {
        value = value.replace('_$!<', '');
        value = value.replace('>!$_', '');
        currentdp.set('type', value.toLowerCase());
      } else {
        for (_j = 0, _len1 = properties.length; _j < _len1; _j++) {
          property = properties[_j];
          _ref4 = property.match(regexps.property), all = _ref4[0], pname = _ref4[1], pvalue = _ref4[2];
          currentdp.set(pname.toLowerCase(), pvalue.toLowerCase());
        }
        if (key === 'adr') {
          value = value.join("\n").replace(/\n+/g, "\n");
        }
        if (key === 'x-abdate') {
          key = 'about';
        }
        if (key === 'x-abrelatednames') {
          key = 'other';
        }
        currentdp.set('name', key.toLowerCase());
        currentdp.set('value', value.replace("\\:", ":"));
      }
    } else if (regexps.complex.test(line)) {
      _ref5 = line.match(regexps.complex), all = _ref5[0], key = _ref5[1], properties = _ref5[2], value = _ref5[3];
      if (currentdp) {
        current.dataPoints.add(currentdp);
      }
      currentdp = new DataPoint();
      value = value.split(';');
      if (value.length === 1) {
        value = value[0];
      }
      key = key.toLowerCase();
      if (key === 'email' || key === 'tel' || key === 'adr' || key === 'url') {
        currentdp.set('name', key);
        if (key === 'adr') {
          value = value.join("\n").replace(/\n+/g, "\n");
        }
      } else {
        currentdp = null;
        continue;
      }
      properties = properties.split(';');
      for (_k = 0, _len2 = properties.length; _k < _len2; _k++) {
        property = properties[_k];
        match = property.match(regexps.property);
        if (match) {
          all = match[0], pname = match[1], pvalue = match[2];
        } else {
          pname = 'type';
          pvalue = property;
        }
        if (pname === 'type' && pvalue === 'pref') {
          currentdp.set('pref', 1);
        } else {
          currentdp.set(pname.toLowerCase(), pvalue.toLowerCase());
        }
      }
      currentdp.set('value', value);
    }
  }
  return imported;
};
});

;require.register("models/contactlog", function(exports, require, module) {
var ContactLog,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = ContactLog = (function(_super) {
  __extends(ContactLog, _super);

  function ContactLog() {
    return ContactLog.__super__.constructor.apply(this, arguments);
  }

  return ContactLog;

})(Backbone.Model);
});

;require.register("models/datapoint", function(exports, require, module) {
var DataPoint,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = DataPoint = (function(_super) {
  __extends(DataPoint, _super);

  function DataPoint() {
    return DataPoint.__super__.constructor.apply(this, arguments);
  }

  DataPoint.prototype.defaults = {
    type: 'main',
    name: 'other',
    value: ''
  };

  return DataPoint;

})(Backbone.Model);
});

;require.register("router", function(exports, require, module) {
var CallImporterView, Contact, ContactView, DocView, ImporterView, Router, app,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app = require('application');

ContactView = require('views/contact');

DocView = require('views/doc');

ImporterView = require('views/importer');

CallImporterView = require('views/callimporter');

Contact = require('models/contact');

module.exports = Router = (function(_super) {
  __extends(Router, _super);

  function Router() {
    return Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.routes = {
    '': 'list',
    'help': 'help',
    'import': 'import',
    'callimport': 'callimport',
    'contact/new': 'newcontact',
    'contact/:id': 'showcontact'
  };

  Router.prototype.initialize = function() {
    return $('body').on('keyup', (function(_this) {
      return function(event) {
        if (event.keyCode === 27) {
          return _this.navigate("", true);
        }
      };
    })(this));
  };

  Router.prototype.list = function() {
    if ($(window).width() > 900) {
      this.help();
    } else {
      this.displayView(null);
    }
    $('#filterfied').focus();
    return app.contactslist.activate(null);
  };

  Router.prototype.help = function() {
    $(".toggled").removeClass('toggled');
    $("#gohelp").addClass('toggled');
    $(".activated").removeClass('activated');
    return this.displayView(new DocView());
  };

  Router.prototype["import"] = function() {
    this.help();
    this.importer = new ImporterView();
    return $('body').append(this.importer.render().$el);
  };

  Router.prototype.callimport = function() {
    this.help();
    this.importer = new CallImporterView();
    return $('body').append(this.importer.render().$el);
  };

  Router.prototype.newcontact = function() {
    var contact;
    $(".toggled").removeClass('toggled');
    $("#new").addClass('toggled');
    $(".activated").removeClass('activated');
    contact = new Contact();
    contact.dataPoints.add({
      name: 'tel',
      type: 'main',
      value: ''
    });
    contact.dataPoints.add({
      name: 'email',
      type: 'main',
      value: ''
    });
    contact.once('change:id', (function(_this) {
      return function() {
        app.contacts.add(contact);
        return _this.navigate("contact/" + contact.id, false);
      };
    })(this));
    this.displayViewFor(contact, true);
    return $('#name').focus();
  };

  Router.prototype.showcontact = function(id) {
    var contact;
    $(".toggled").removeClass('toggled');
    if (app.contacts.length === 0) {
      app.contacts.once('sync', (function(_this) {
        return function() {
          return _this.showcontact(id);
        };
      })(this));
      return;
    }
    contact = app.contacts.get(id);
    if (contact) {
      this.displayViewFor(contact);
      return app.contactslist.activate(contact);
    } else {
      alert(t("this contact doesn't exist"));
      return this.navigate('', true);
    }
  };

  Router.prototype.displayView = function(view, creation) {
    var _ref, _ref1, _ref2;
    if (this.currentContact) {
      this.stopListening(this.currentContact);
    }
    if (((_ref = app.contactview) != null ? _ref.needSaving : void 0) && confirm(t('Save changes ?'))) {
      app.contactview.save();
      app.contactview.model.once('sync', (function(_this) {
        return function() {
          return _this.displayView(view);
        };
      })(this));
      return;
    }
    if (this.importer) {
      this.importer.close();
    }
    this.importer = null;
    if (app.contactview) {
      app.contactview.remove();
    }
    app.contactview = view;
    if ((_ref1 = app.contactview) != null) {
      _ref1.$el.appendTo($('body'));
    }
    if ((_ref2 = app.contactview) != null) {
      _ref2.render();
    }
    if (creation) {
      if (view != null) {
        view.$("#more-options").hide();
      }
      if (view != null) {
        view.$("#adder").show();
      }
      return view != null ? view.$("#adder h2").show() : void 0;
    }
  };

  Router.prototype.displayViewFor = function(contact, creation) {
    this.currentContact = contact;
    this.displayView(new ContactView({
      model: contact
    }), creation);
    return this.listenTo(contact, 'destroy', function() {
      return this.navigate('', true);
    });
  };

  return Router;

})(Backbone.Router);
});

;require.register("templates/callimporter", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),countries = locals_.countries;
buf.push("<div class=\"modal-header\">" + (jade.escape(null == (jade_interp = t("import call log")) ? "" : jade_interp)) + "</div><div id=\"import-file\" class=\"modal-body\"><p>" + (jade.escape(null == (jade_interp = t('import call log help')) ? "" : jade_interp)) + "</p><ul><li>" + (jade.escape(null == (jade_interp = t('import android calls')) ? "" : jade_interp)) + "<a href=\"https://play.google.com/store/apps/details?id=com.dukemdev\" target=\"_blank\">Call Log Export</a></li><li>" + (jade.escape(null == (jade_interp = t('import android sms')) ? "" : jade_interp)) + "<a href=\"https://play.google.com/store/apps/details?id=com.smeiti.smstotext\" target=\"_blank\">SMS To Text</a></li><li>" + (jade.escape(null == (jade_interp = t('import ios calls')) ? "" : jade_interp)) + "<a href=\"https://github.com/mycozycloud/cozy-contacts/blob/master/TODO.md#mobile\" target=\"_blank\">Github</a></li></ul><div class=\"control-group\"><label for=\"country\" class=\"control-label\">" + (jade.escape(null == (jade_interp = t("choose phone country")) ? "" : jade_interp)) + "</label><div class=\"controls\"><select id=\"phonecountry\">");
// iterate countries
;(function(){
  var $$obj = countries;
  if ('number' == typeof $$obj.length) {

    for (var country = 0, $$l = $$obj.length; country < $$l; country++) {
      var code = $$obj[country];

buf.push("<option" + (jade.attr("value", code, true, false)) + ">" + (jade.escape(null == (jade_interp = code + ' ' + country) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var country in $$obj) {
      $$l++;      var code = $$obj[country];

buf.push("<option" + (jade.attr("value", code, true, false)) + ">" + (jade.escape(null == (jade_interp = code + ' ' + country) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select></div><label for=\"csvupload\" class=\"control-label\">" + (jade.escape(null == (jade_interp = t("choose log file")) ? "" : jade_interp)) + "</label><div class=\"controls\"><input id=\"csvupload\" type=\"file\" accept=\"text/csv;text/plain\"/><span class=\"help-inline\"></span></div></div></div><div id=\"import-config\" class=\"modal-body\"><p>" + (jade.escape(null == (jade_interp = t('ready to import')) ? "" : jade_interp)) + "</p><table class=\"table stripped-table\"><thead><th>" + (jade.escape(null == (jade_interp = t('log direction')) ? "" : jade_interp)) + "</th><th>" + (jade.escape(null == (jade_interp = t('log number')) ? "" : jade_interp)) + "</th><th>" + (jade.escape(null == (jade_interp = t('log date')) ? "" : jade_interp)) + "</th></thead><tbody></tbody></table></div><div id=\"import-confirm\" class=\"modal-body\"><p>" + (jade.escape(null == (jade_interp = t('importing this file')) ? "" : jade_interp)) + "</p><p>" + (jade.escape(null == (jade_interp = t('may take a while')) ? "" : jade_interp)) + "</p></div><div class=\"modal-footer\"><a id=\"cancel-btn\" href=\"#\" class=\"minor-button\">" + (jade.escape(null == (jade_interp = t("cancel")) ? "" : jade_interp)) + "</a><a id=\"confirm-btn\" class=\"button disabled\">" + (jade.escape(null == (jade_interp = t("import")) ? "" : jade_interp)) + "</a></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/contact", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),hasPicture = locals_.hasPicture,id = locals_.id,fn = locals_.fn,tags = locals_.tags,note = locals_.note;
buf.push("<div id=\"contact-container\"><a id=\"close\" href=\"#\">&lt;</a><div id=\"picture\">");
if ( hasPicture)
{
buf.push("<img" + (jade.attr("src", "contacts/" + (id) + "/picture.png", true, false)) + " class=\"picture\"/>");
}
else
{
buf.push("<img src=\"img/defaultpicture.png\" class=\"picture\"/>");
}
buf.push("<div id=\"uploadnotice\">" + (jade.escape(null == (jade_interp = t("change")) ? "" : jade_interp)) + "</div><input id=\"uploader\" type=\"file\"/></div><div id=\"wrap-name-notes\"><input id=\"name\"" + (jade.attr("placeholder", t("name"), true, false)) + (jade.attr("value", "" + (fn) + "", true, false)) + "/><a id=\"name-edit\">" + (jade.escape(null == (jade_interp = t('edit name')) ? "" : jade_interp)) + "</a><input id=\"tags\"" + (jade.attr("value", tags.join(','), true, false)) + " class=\"tagit\"/></div><span id=\"save-info\">" + (jade.escape(null == (jade_interp = t('changes saved') + ' ') ? "" : jade_interp)) + "<a id=\"undo\">" + (jade.escape(null == (jade_interp = t('undo')) ? "" : jade_interp)) + "</a></span><div id=\"right\"><ul class=\"nav nav-tabs\"><li><a id=\"infotab\" href=\"#info\" data-toggle=\"tab\">" + (jade.escape(null == (jade_interp = t('info')) ? "" : jade_interp)) + "</a></li><li class=\"active\"><a href=\"#notes-zone\" data-toggle=\"tab\">" + (jade.escape(null == (jade_interp = t('notes')) ? "" : jade_interp)) + "</a></li><li><a href=\"#history\" data-toggle=\"tab\" class=\"tab\">" + (jade.escape(null == (jade_interp = t('history')) ? "" : jade_interp)) + "</a></li></ul><div class=\"tab-content\"><div id=\"notes-zone\" class=\"tab-pane active\"><textarea rows=\"3\"" + (jade.attr("placeholder", t('notes placeholder'), true, false)) + " id=\"notes\">" + (jade.escape((jade_interp = note) == null ? '' : jade_interp)) + "</textarea></div><div id=\"history\" class=\"tab-pane\"></div><div id=\"info\" class=\"tab-pane\"></div></div></div><div id=\"left\"><div id=\"abouts\" class=\"zone\"><h2>" + (jade.escape(null == (jade_interp = t("about")) ? "" : jade_interp)) + "</h2><ul></ul><a class=\"btn add addabout\">" + (jade.escape(null == (jade_interp = t('add')) ? "" : jade_interp)) + "</a></div><div id=\"tels\" class=\"zone\"><h2>" + (jade.escape(null == (jade_interp = t("phones")) ? "" : jade_interp)) + "</h2><ul></ul><a class=\"btn add addtel\">" + (jade.escape(null == (jade_interp = t('add')) ? "" : jade_interp)) + "</a></div><div id=\"emails\" class=\"zone\"><h2>" + (jade.escape(null == (jade_interp = t("emails")) ? "" : jade_interp)) + "</h2><ul></ul><a class=\"btn add addemail\">" + (jade.escape(null == (jade_interp = t('add')) ? "" : jade_interp)) + "</a></div><div id=\"adrs\" class=\"zone\"><h2>" + (jade.escape(null == (jade_interp = t("postal")) ? "" : jade_interp)) + "</h2><ul></ul><a class=\"btn add addadr\">" + (jade.escape(null == (jade_interp = t('add')) ? "" : jade_interp)) + "</a></div><div id=\"urls\" class=\"zone\"><h2>" + (jade.escape(null == (jade_interp = t("links")) ? "" : jade_interp)) + "</h2><ul></ul><a class=\"btn add addurl\">" + (jade.escape(null == (jade_interp = t('add')) ? "" : jade_interp)) + "</a></div><div id=\"others\" class=\"zone\"><h2>" + (jade.escape(null == (jade_interp = t("others")) ? "" : jade_interp)) + "</h2><ul></ul><a class=\"btn add addother\">" + (jade.escape(null == (jade_interp = t('add')) ? "" : jade_interp)) + "</a></div><div class=\"zone clearfix\">&nbsp;</div><div class=\"zone\"><a id=\"more-options\" class=\"button\">" + (jade.escape(null == (jade_interp = t('more options')) ? "" : jade_interp)) + "</a><a id=\"create-task\" class=\"button\">" + (jade.escape(null == (jade_interp = t('create call task')) ? "" : jade_interp)) + "</a></div><div id=\"adder\" class=\"zone\"><h2>" + (jade.escape(null == (jade_interp = t("actions")) ? "" : jade_interp)) + "</h2><h3>" + (jade.escape(null == (jade_interp = t("add fields")) ? "" : jade_interp)) + "</h3><a class=\"button addbirthday\">" + (jade.escape(null == (jade_interp = t("birthday") + ' ') ? "" : jade_interp)) + "</a><a class=\"button addorg\">" + (jade.escape(null == (jade_interp = t("company") + ' ') ? "" : jade_interp)) + "</a><a class=\"button addtitle\">" + (jade.escape(null == (jade_interp = t("title") + ' ') ? "" : jade_interp)) + "</a><a class=\"button addcozy\">" + (jade.escape(null == (jade_interp = t("cozy url") + ' ') ? "" : jade_interp)) + "</a><a class=\"button addtwitter\">" + (jade.escape(null == (jade_interp = t("twitter") + ' ') ? "" : jade_interp)) + "</a><a class=\"button addtel\">" + (jade.escape(null == (jade_interp = t("phone") + ' ') ? "" : jade_interp)) + "</a><a class=\"button addemail\">" + (jade.escape(null == (jade_interp = t("email") + ' ') ? "" : jade_interp)) + "</a><a class=\"button addadr\">" + (jade.escape(null == (jade_interp = t("postal") + ' ') ? "" : jade_interp)) + "</a><a class=\"button addurl\">" + (jade.escape(null == (jade_interp = t("url") + ' ') ? "" : jade_interp)) + "</a><a class=\"button addskype\">" + (jade.escape(null == (jade_interp = t("skype") + ' ') ? "" : jade_interp)) + "</a><a class=\"button addother\">" + (jade.escape(null == (jade_interp = t("other")) ? "" : jade_interp)) + "</a><h3>" + (jade.escape(null == (jade_interp = t("delete")) ? "" : jade_interp)) + "</h3><a id=\"delete\"" + (jade.attr("title", t("delete contact"), true, false)) + " class=\"button\">" + (jade.escape(null == (jade_interp = t('delete contact')) ? "" : jade_interp)) + "</a></div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/contactslist", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<form id=\"toolbar\" class=\"form-search\"><div class=\"input-append input-prepend\"><span class=\"add-on\"><i class=\"icon-search icon-white\"></i></span><input id=\"filterfield\" type=\"text\"" + (jade.attr("placeholder", t("search placeholder"), true, false)) + " class=\"search-query input-large\"/><a id=\"filterClean\" class=\"button\"><i class=\"icon-remove icon-white\"></i></a></div><a id=\"new\" href=\"#contact/new\"" + (jade.attr("title", t("add contact"), true, false)) + " class=\"button\"><i class=\"icon-plus icon-white\"></i></a><a id=\"gohelp\" href=\"#help\"" + (jade.attr("title", t("go to settings"), true, false)) + " class=\"button\"><i class=\"icon-cog icon-white\"></i></a></form><div id=\"contacts\"></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/contactslist_item", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),hasPicture = locals_.hasPicture,id = locals_.id,fn = locals_.fn,bestmail = locals_.bestmail,besttel = locals_.besttel;
if ( hasPicture)
{
buf.push("<img" + (jade.attr("src", "contacts/" + (id) + "/picture.png", true, false)) + "/>");
}
else
{
buf.push("<img src=\"img/defaultpicture.png\"/>");
}
buf.push("<h2>" + (jade.escape((jade_interp = fn) == null ? '' : jade_interp)) + "</h2><div class=\"infos\"><span class=\"email\">" + (jade.escape((jade_interp = bestmail) == null ? '' : jade_interp)) + "</span><span class=\"tel\">  " + (jade.escape((jade_interp = besttel) == null ? '' : jade_interp)) + "</span></div><div class=\"clearfix\"></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/datapoint", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),type = locals_.type,name = locals_.name,placeholder = locals_.placeholder,value = locals_.value;
buf.push("<input type=\"text\" data-provide=\"typeahead\"" + (jade.attr("value", "" + (type) + "", true, false)) + " class=\"type\"/>");
if ( name == 'adr')
{
buf.push("<textarea rows=\"4\"" + (jade.attr("placeholder", "" + (placeholder) + "", true, false)) + " class=\"value\">" + (jade.escape((jade_interp = value) == null ? '' : jade_interp)) + "</textarea>");
}
else
{
buf.push("<input type=\"text\"" + (jade.attr("placeholder", "" + (placeholder) + "", true, false)) + (jade.attr("value", "" + (value) + "", true, false)) + " class=\"value\"/>");
}
buf.push("<a class=\"dpaction\"><i class=\"icon\"></i></a><a" + (jade.attr("title", t('remove datapoint'), true, false)) + " class=\"dpremove\"><i class=\"icon-trash\"></i></a>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/doc", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<a id=\"close\" href=\"#\">&lt;</a><h2>" + (jade.escape(null == (jade_interp = t('help')) ? "" : jade_interp)) + "</h2><p>" + (jade.escape(null == (jade_interp = t("search info")) ? "" : jade_interp)) + "</p><p>" + (jade.escape(null == (jade_interp = t("click left to display")) ? "" : jade_interp)) + "</p><p>" + (jade.escape(null == (jade_interp = t("creation info")) ? "" : jade_interp)) + "</p><p>" + (jade.escape(null == (jade_interp = t("carddav info")) ? "" : jade_interp)) + "</p><h2>" + (jade.escape(null == (jade_interp = t('settings')) ? "" : jade_interp)) + "</h2><p id=\"config-now\" class=\"important\">" + (jade.escape(null == (jade_interp = t('do this now')) ? "" : jade_interp)) + "</p><label for=\"nameFormat\" class=\"control-label\">" + (jade.escape(null == (jade_interp = t('name format info')) ? "" : jade_interp)) + "</label><div class=\"control\"><select id=\"nameFormat\" class=\"span5 large\"><option value=\"\">" + (jade.escape(null == (jade_interp = t('name format info')) ? "" : jade_interp)) + "</option><option value=\"given-familly\">" + (jade.escape(null == (jade_interp = t('format given familly')) ? "" : jade_interp)) + "</option><option value=\"familly-given\">" + (jade.escape(null == (jade_interp = t('format familly given')) ? "" : jade_interp)) + "</option><option value=\"given-middleinitial-familly\">" + (jade.escape(null == (jade_interp = t('format given mid familly')) ? "" : jade_interp)) + "</option></select><span class=\"help-inline\"></span></div><h2>" + (jade.escape(null == (jade_interp = t('import export')) ? "" : jade_interp)) + "</h2><p>" + (jade.escape(null == (jade_interp = t("call log info") + ' ') ? "" : jade_interp)) + "<a href=\"#callimport\">" + (jade.escape(null == (jade_interp = t('import call log')) ? "" : jade_interp)) + "</a></p><p>" + (jade.escape(null == (jade_interp = t('vcard export info') + ' ') ? "" : jade_interp)) + "<a href=\"contacts.vcf\" download=\"contacts.vcf\"" + (jade.attr("title", t("export vcard"), true, false)) + ">" + (jade.escape(null == (jade_interp = t('export all vcard')) ? "" : jade_interp)) + "</a></p><p>" + (jade.escape(null == (jade_interp = t("vcard import info") + ' ') ? "" : jade_interp)) + "<a href=\"#import\">" + (jade.escape(null == (jade_interp = t('import vcard')) ? "" : jade_interp)) + "</a></p>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/history_item", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),typeIcon = locals_.typeIcon,date = locals_.date,content = locals_.content;
buf.push("<div class=\"wrap\"><div class=\"details\"><i" + (jade.cls([typeIcon], [true])) + "></i>" + (jade.escape((jade_interp = date) == null ? '' : jade_interp)) + "</div><div class=\"content\">" + (jade.escape(null == (jade_interp = content) ? "" : jade_interp)) + "</div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/importer", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"modal-header\">" + (jade.escape(null == (jade_interp = t("import vcard")) ? "" : jade_interp)) + "</div><div class=\"modal-body\"><div class=\"control-group\"><label for=\"vcfupload\" class=\"control-label\">" + (jade.escape(null == (jade_interp = t("choose vcard file")) ? "" : jade_interp)) + "</label><div class=\"controls\"><input id=\"vcfupload\" type=\"file\"/><span class=\"help-inline\"></span></div></div></div><div class=\"modal-footer\"><a id=\"cancel-btn\" href=\"#\" class=\"minor-button\">" + (jade.escape(null == (jade_interp = t("cancel")) ? "" : jade_interp)) + "</a><a id=\"confirm-btn\" class=\"button disabled\">" + (jade.escape(null == (jade_interp = t("import")) ? "" : jade_interp)) + "</a></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/name_modal", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),n = locals_.n,fn = locals_.fn;
buf.push("<div class=\"modal-header\">" + (jade.escape(null == (jade_interp = t("name editor")) ? "" : jade_interp)) + "</div><div class=\"modal-body\"><form class=\"form-horizontal\"><div class=\"control-group\"><label for=\"prefix\" class=\"control-label\">" + (jade.escape(null == (jade_interp = t("prefix")) ? "" : jade_interp)) + "</label><div class=\"controls\"><input id=\"prefix\" type=\"text\"" + (jade.attr("value", n[3], true, false)) + (jade.attr("placeholder", t("placeholder prefix"), true, false)) + "/></div></div><div class=\"control-group\"><label for=\"first\" class=\"control-label\">" + (jade.escape(null == (jade_interp = t("first name")) ? "" : jade_interp)) + "</label><div class=\"controls\"><input id=\"first\" type=\"text\"" + (jade.attr("value", n[1], true, false)) + (jade.attr("placeholder", t("placeholder first"), true, false)) + "/></div></div><div class=\"control-group\"><label for=\"middle\" class=\"control-label\">" + (jade.escape(null == (jade_interp = t("middle name")) ? "" : jade_interp)) + "</label><div class=\"controls\"><input id=\"middle\" type=\"text\"" + (jade.attr("value", n[2], true, false)) + (jade.attr("placeholder", t("placeholder middle"), true, false)) + "/></div></div><div class=\"control-group\"><label for=\"last\" class=\"control-label\">" + (jade.escape(null == (jade_interp = t("last name")) ? "" : jade_interp)) + "</label><div class=\"controls\"><input id=\"last\" type=\"text\"" + (jade.attr("value", n[0], true, false)) + (jade.attr("placeholder", t("placeholder last"), true, false)) + "/></div></div><div class=\"control-group\"><label for=\"suffix\" class=\"control-label\">" + (jade.escape(null == (jade_interp = t("suffix")) ? "" : jade_interp)) + "</label><div class=\"controls\"><input id=\"suffix\" type=\"text\"" + (jade.attr("value", n[4], true, false)) + (jade.attr("placeholder", t("placeholder suffix"), true, false)) + "/></div></div><div class=\"control-group\"><label for=\"full\" class=\"control-label\">" + (jade.escape(null == (jade_interp = t("full name")) ? "" : jade_interp)) + "</label><div class=\"controls\"><input id=\"full\" type=\"text\" disabled=\"disabled\"" + (jade.attr("value", fn, true, false)) + "/></div></div></form></div><div class=\"modal-footer\"><a id=\"cancel-btn\" class=\"minor-button\">" + (jade.escape(null == (jade_interp = t("cancel")) ? "" : jade_interp)) + "</a><a id=\"confirm-btn\" class=\"button\">" + (jade.escape(null == (jade_interp = t("save")) ? "" : jade_interp)) + "</a></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/callimporter", function(exports, require, module) {
var BaseView, CallImporterView, CallLogReader, ContactLogCollection, app,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

CallLogReader = require('lib/call_log_reader');

ContactLogCollection = require('collections/contactlog');

app = require('application');

module.exports = CallImporterView = (function(_super) {
  __extends(CallImporterView, _super);

  function CallImporterView() {
    this.close = __bind(this.close, this);
    this.showFaillure = __bind(this.showFaillure, this);
    this.onLogFileParsed = __bind(this.onLogFileParsed, this);
    this.onLogFileProgress = __bind(this.onLogFileProgress, this);
    return CallImporterView.__super__.constructor.apply(this, arguments);
  }

  CallImporterView.prototype.template = require('templates/callimporter');

  CallImporterView.prototype.id = 'callimporter';

  CallImporterView.prototype.tagName = 'div';

  CallImporterView.prototype.className = 'modal fade';

  CallImporterView.prototype.events = function() {
    return {
      'change #csvupload': 'onUpload',
      'click  #confirm-btn': 'doImport'
    };
  };

  CallImporterView.prototype.getRenderData = function() {
    return {
      countries: require('lib/phone_number').countries
    };
  };

  CallImporterView.prototype.afterRender = function() {
    this.$el.modal('show');
    this.upload = this.$('#csvupload')[0];
    this.country = this.$('#phonecountry');
    this.file_step = this.$('#import-file');
    this.parse_step = this.$('#import-config').hide();
    this.confirm_step = this.$('#import-confirm').hide();
    return this.confirmBtn = this.$('#confirm-btn');
  };

  CallImporterView.prototype.onUpload = function() {
    var country, file, reader;
    file = this.upload.files[0];
    country = this.country.val();
    reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = (function(_this) {
      return function() {
        var error;
        try {
          return CallLogReader.parse(reader.result, country, _this.onLogFileParsed, _this.onLogFileProgress);
        } catch (_error) {
          error = _error;
          console.log(error.stack);
          _this.$('.control-group').addClass('error');
          return _this.$('.help-inline').text(t('failed to parse'));
        }
      };
    })(this);
    return reader.onerror = (function(_this) {
      return function() {
        return console.log("ERROR READING", reader.result, reader.error);
      };
    })(this);
  };

  CallImporterView.prototype.onLogFileProgress = function(done, total) {
    var p;
    p = Math.round(100 * done / total);
    return this.$('.help-inline').text(t('progress') + (": " + p + "%"));
  };

  CallImporterView.prototype.onLogFileParsed = function(err, toImport) {
    var content, html, log, _i, _len;
    if (err) {
      console.log(error.stack);
      this.$('.control-group').addClass('error');
      this.$('.help-inline').text(t('failed to parse'));
      return;
    }
    this.file_step.remove();
    this.parse_step.show();
    for (_i = 0, _len = toImport.length; _i < _len; _i++) {
      log = toImport[_i];
      content = log.content.message || this.formatDuration(log.content.duration);
      html = '<tr>';
      html += "<td> " + log.direction + " </td>";
      html += "<td> " + log.remote.tel + " </td>";
      html += "<td> " + (Date.create(log.timestamp).format()) + " </td>";
      html += "<td> " + content + " </td>";
      html += '</tr>';
      this.$('tbody').append($(html));
    }
    this.toImport = toImport;
    return this.confirmBtn.removeClass('disabled');
  };

  CallImporterView.prototype.formatDuration = function(duration) {
    var hours, minutes, out, seconds;
    seconds = duration % 60;
    minutes = (duration - seconds) % 3600;
    hours = duration - minutes - seconds;
    out = seconds + t('seconds');
    if (minutes) {
      out = minutes / 60 + t('minutes') + ' ' + out;
    }
    if (hours) {
      out = hours / 3600 + t('hours') + ' ' + out;
    }
    return out;
  };

  CallImporterView.prototype.doImport = function() {
    var req;
    if (this.confirmBtn.hasClass('disabled')) {
      return;
    }
    this.parse_step.remove();
    this.confirm_step.show();
    this.confirmBtn.addClass('disabled');
    req = $.ajax('logs', {
      type: 'POST',
      data: JSON.stringify(new ContactLogCollection(this.toImport).toJSON()),
      contentType: 'application/json',
      dataType: 'json'
    });
    req.done((function(_this) {
      return function(data) {
        if (data.success) {
          return _this.close();
        } else {
          return _this.showFaillure();
        }
      };
    })(this));
    return req.fail(this.showFaillure);
  };

  CallImporterView.prototype.showFaillure = function() {
    this.$('.modal-body').html('<p>' + t('import fail') + '</p>');
    return this.confirmBtn.remove();
  };

  CallImporterView.prototype.close = function() {
    this.$el.modal('hide');
    app.router.navigate('');
    return this.remove();
  };

  return CallImporterView;

})(BaseView);
});

;require.register("views/contact", function(exports, require, module) {
var ContactView, Datapoint, HistoryView, NameModal, TagsView, ViewCollection,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ViewCollection = require('lib/view_collection');

HistoryView = require('views/history');

TagsView = require('views/contact_tags');

NameModal = require('views/contact_name_modal');

Datapoint = require('models/datapoint');

module.exports = ContactView = (function(_super) {
  __extends(ContactView, _super);

  ContactView.prototype.id = 'contact';

  ContactView.prototype.template = require('templates/contact');

  ContactView.prototype.itemView = require('views/datapoint');

  ContactView.prototype.events = function() {
    return {
      'click .addbirthday': this.addClicked('about', 'birthday'),
      'click .addorg': this.addClicked('about', 'company'),
      'click .addtitle': this.addClicked('about', 'title'),
      'click .addcozy': this.addClicked('about', 'cozy'),
      'click .addtwitter': this.addClicked('about', 'twitter'),
      'click .addabout': this.addClicked('about'),
      'click .addtel': this.addClicked('tel'),
      'click .addemail': this.addClicked('email'),
      'click .addadr': this.addClicked('adr'),
      'click .addother': this.addClicked('other'),
      'click .addurl': this.addClicked('url'),
      'click .addskype': this.addClicked('other', 'skype'),
      'click #more-options': 'onMoreOptionsClicked',
      'click #create-task': 'onCreateTaskClicked',
      'click #name-edit': 'showNameModal',
      'click #undo': 'undo',
      'click #delete': 'delete',
      'change #uploader': 'photoChanged',
      'keyup input.value': 'addBelowIfEnter',
      'keydown #notes': 'resizeNote',
      'keypress #notes': 'resizeNote',
      'keyup #name': 'doNeedSaving',
      'keyup #notes': 'doNeedSaving',
      'keydown #name': 'onNameKeyPress',
      'keydown textarea#notes': 'onNoteKeyPress',
      'keydown .ui-widget-content': 'onTagInputKeyPress',
      'blur #name': 'changeOccured',
      'blur #notes': 'changeOccured'
    };
  };

  function ContactView(options) {
    this.photoChanged = __bind(this.photoChanged, this);
    this.resizeNiceScroll = __bind(this.resizeNiceScroll, this);
    this.modelChanged = __bind(this.modelChanged, this);
    this.undo = __bind(this.undo, this);
    this.onCreateTaskClicked = __bind(this.onCreateTaskClicked, this);
    this.onMoreOptionsClicked = __bind(this.onMoreOptionsClicked, this);
    this.showNameModal = __bind(this.showNameModal, this);
    this.save = __bind(this.save, this);
    this.changeOccured = __bind(this.changeOccured, this);
    this.doNeedSaving = __bind(this.doNeedSaving, this);
    options.collection = options.model.dataPoints;
    ContactView.__super__.constructor.apply(this, arguments);
  }

  ContactView.prototype.initialize = function() {
    ContactView.__super__.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change', this.modelChanged);
    this.listenTo(this.model, 'sync', this.onSuccess);
    this.listenTo(this.model.history, 'add', this.resizeNiceScroll);
    this.listenTo(this.collection, 'change', (function(_this) {
      return function() {
        _this.needSaving = true;
        return _this.changeOccured();
      };
    })(this));
    return this.listenTo(this.collection, 'remove', (function(_this) {
      return function() {
        _this.needSaving = true;
        return _this.changeOccured();
      };
    })(this));
  };

  ContactView.prototype.getRenderData = function() {
    return _.extend({}, this.model.toJSON(), {
      hasPicture: this.model.hasPicture || false,
      fn: this.model.getFN()
    });
  };

  ContactView.prototype.afterRender = function() {
    var type, _i, _len, _ref;
    this.zones = {};
    _ref = ['about', 'email', 'adr', 'tel', 'url', 'other'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      type = _ref[_i];
      this.zones[type] = this.$('#' + type + 's ul');
    }
    this.hideEmptyZones();
    this.savedInfo = this.$('#save-info').hide();
    this.needSaving = false;
    this.namefield = this.$('#name');
    this.notesfield = this.$('#notes');
    this.uploader = this.$('#uploader')[0];
    this.picture = this.$('#picture .picture');
    this.tags = new TagsView({
      el: this.$('#tags'),
      model: this.model,
      onChange: (function(_this) {
        return function() {
          _this.needSaving = true;
          return _this.changeOccured(true);
        };
      })(this)
    });
    ContactView.__super__.afterRender.apply(this, arguments);
    this.$el.niceScroll();
    this.resizeNote();
    this.currentState = this.model.toJSON();
    this.history = new HistoryView({
      collection: this.model.history
    });
    this.history.render().$el.appendTo(this.$('#history'));
    if ($(window).width() < 900) {
      this.$('a#infotab').tab('show');
    }
    this.$('a[data-toggle="tab"]').on('shown', (function(_this) {
      return function() {
        if ($(window).width() < 900) {
          _this.$('#left').hide();
        }
        return _this.resizeNiceScroll();
      };
    })(this));
    this.$('a#infotab').on('shown', (function(_this) {
      return function() {
        _this.$('#left').show();
        return _this.resizeNiceScroll();
      };
    })(this));
    this.createTaskButton = this.$("#create-task");
    if (this.model.get('id') == null) {
      return this.createTaskButton.hide();
    }
  };

  ContactView.prototype.remove = function() {
    this.$el.getNiceScroll().remove();
    return ContactView.__super__.remove.apply(this, arguments);
  };

  ContactView.prototype.hideEmptyZones = function() {
    var hasOne, name, type, zone, _i, _len, _ref, _ref1;
    _ref = this.zones;
    for (type in _ref) {
      zone = _ref[type];
      hasOne = this.model.dataPoints.hasOne(type);
      zone.parent().toggle(hasOne);
      this.$("#adder .add" + type).toggle(!hasOne);
    }
    _ref1 = ['birthday', 'org', 'title', 'cozy'];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      name = _ref1[_i];
      hasOne = this.model.dataPoints.hasOne('about', name);
      this.$("#adder .add" + name).toggle(!hasOne);
    }
    this.$('#adder h2').toggle(this.$('#adder a:visible').length !== 0);
    return this.resizeNiceScroll();
  };

  ContactView.prototype.appendView = function(dataPointView) {
    var type;
    if (!this.zones) {
      return;
    }
    type = dataPointView.model.get('name');
    this.zones[type].append(dataPointView.el);
    return this.hideEmptyZones();
  };

  ContactView.prototype.addClicked = function(name, type) {
    return function(event) {
      var point, toFocus, typeField;
      event.preventDefault();
      point = new Datapoint({
        name: name
      });
      if (type != null) {
        point.set('type', type);
      }
      if (type === 'twitter') {
        point.set('value', '@');
      }
      this.model.dataPoints.add(point);
      toFocus = type != null ? '.value' : '.type';
      typeField = this.zones[name].children().last().find(toFocus);
      typeField.focus();
      return typeField.select();
    };
  };

  ContactView.prototype.doNeedSaving = function(event) {
    var isEnter;
    isEnter = event.keyCode === 13 || event.which === 13;
    if (isEnter && event.target.id === 'name') {
      this.changeOccured(true);
    }
    this.needSaving = true;
    return true;
  };

  ContactView.prototype.changeOccured = function(forceImmediate) {
    return setTimeout((function(_this) {
      return function() {
        if (_this.$('input:focus, textarea:focus').length && !forceImmediate) {
          return true;
        }
        _this.model.setFN(_this.namefield.val());
        _this.model.set({
          note: _this.notesfield.val()
        });
        if (_.isEqual(_this.currentState, _this.model.toJSON())) {
          return _this.needSaving = false;
        } else {
          _this.savedInfo.hide();
          return _this.save();
        }
      };
    })(this), 10);
  };

  ContactView.prototype["delete"] = function() {
    if (this.model.isNew() || confirm(t('Are you sure ?'))) {
      return this.model.destroy();
    }
  };

  ContactView.prototype.save = function() {
    if (!this.needSaving) {
      return;
    }
    this.needSaving = false;
    this.savedInfo.show().text('saving changes');
    return this.model.save();
  };

  ContactView.prototype.showNameModal = function() {
    var modal;
    modal = new NameModal({
      model: this.model,
      onChange: (function(_this) {
        return function() {
          _this.needSaving = true;
          return _this.save();
        };
      })(this)
    });
    $('body').append(modal.$el);
    return modal.render();
  };

  ContactView.prototype.onMoreOptionsClicked = function() {
    return this.$("#more-options").fadeOut((function(_this) {
      return function() {
        _this.$("#adder h2").show();
        _this.$("#adder").fadeIn();
        return _this.resizeNiceScroll();
      };
    })(this));
  };

  ContactView.prototype.onCreateTaskClicked = function() {
    var value;
    value = this.createTaskButton.html();
    this.createTaskButton.html(t('creating...'));
    return this.model.createTask((function(_this) {
      return function(err) {
        _this.createTaskButton.html(value);
        if (err) {
          return alert("An error occured while creating task");
        } else {
          return alert("Task created");
        }
      };
    })(this));
  };

  ContactView.prototype.undo = function() {
    if (!this.lastState) {
      return;
    }
    this.model.set(this.lastState, {
      parse: true
    });
    this.model.save(null, {
      undo: true
    });
    return this.resizeNote();
  };

  ContactView.prototype.onSuccess = function(model, result, options) {
    var undo;
    if (options.undo) {
      this.savedInfo.text(t('undone') + ' ');
      this.lastState = null;
      setTimeout((function(_this) {
        return function() {
          return _this.savedInfo.fadeOut();
        };
      })(this), 1000);
    } else {
      this.savedInfo.text(t('changes saved') + ' ');
      undo = $("<a id='undo'>" + (t('undo')) + "</a>");
      this.savedInfo.append(undo);
      this.lastState = this.currentState;
    }
    return this.currentState = this.model.toJSON();
  };

  ContactView.prototype.modelChanged = function() {
    var _ref;
    this.notesfield.val(this.model.get('note'));
    this.namefield.val(this.model.getFN());
    if ((_ref = this.tags) != null) {
      _ref.refresh();
    }
    return this.resizeNote();
  };

  ContactView.prototype.addBelowIfEnter = function(event) {
    var name, point, typeField, zone;
    if ((event.which || event.keyCode) !== 13) {
      return true;
    }
    zone = $(event.target).parents('.zone')[0].id;
    name = zone.substring(0, zone.length - 1);
    point = new Datapoint({
      name: name
    });
    this.model.dataPoints.add(point);
    typeField = this.zones[name].children().last().find('.type');
    typeField.focus();
    typeField.select();
    return false;
  };

  ContactView.prototype.resizeNote = function(event) {
    var loc, notes, rows;
    notes = this.notesfield.val();
    rows = loc = 0;
    while (loc = notes.indexOf("\n", loc) + 1) {
      rows++;
    }
    this.notesfield.prop('rows', rows + 2);
    return this.resizeNiceScroll();
  };

  ContactView.prototype.resizeNiceScroll = function(event) {
    return this.$el.getNiceScroll().resize();
  };

  ContactView.prototype.photoChanged = function() {
    var file, img, reader;
    file = this.uploader.files[0];
    if (!file.type.match(/image\/.*/)) {
      return alert(t('This is not an image'));
    }
    reader = new FileReader();
    img = new Image();
    reader.readAsDataURL(file);
    return reader.onloadend = (function(_this) {
      return function() {
        img.src = reader.result;
        return img.onload = function() {
          var array, binary, blob, canvas, ctx, dataUrl, i, ratio, ratiodim, _i, _ref;
          ratiodim = img.width > img.height ? 'height' : 'width';
          ratio = 64 / img[ratiodim];
          canvas = document.createElement('canvas');
          canvas.height = canvas.width = 64;
          ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, ratio * img.width, ratio * img.height);
          dataUrl = canvas.toDataURL('image/jpeg');
          _this.picture.attr('src', dataUrl);
          binary = atob(dataUrl.split(',')[1]);
          array = [];
          for (i = _i = 0, _ref = binary.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
            array.push(binary.charCodeAt(i));
          }
          blob = new Blob([new Uint8Array(array)], {
            type: 'image/jpeg'
          });
          _this.model.picture = blob;
          return _this.model.save(null, {
            undo: true
          });
        };
      };
    })(this);
  };

  ContactView.prototype.onTagInputKeyPress = function(event) {
    var keyCode;
    keyCode = event.keyCode || event.which;
    if (keyCode === 9) {
      if (event.shiftKey) {
        this.$('#name').focus();
      } else {
        this.$('.type:visible').first().focus();
      }
      event.preventDefault();
      return false;
    }
  };

  ContactView.prototype.onNameKeyPress = function(event) {
    var keyCode;
    keyCode = event.keyCode || event.which;
    if (keyCode === 9) {
      if (event.shiftKey) {
        this.$('textarea#notes').focus();
      } else {
        this.$('input.ui-widget-content').focus();
      }
      event.preventDefault();
      return false;
    }
  };

  ContactView.prototype.onNoteKeyPress = function(event) {
    var keyCode;
    keyCode = event.keyCode || event.which;
    if (keyCode === 9) {
      if (event.shiftKey) {
        this.$('.value:visible').last().focus();
      } else {
        this.$('#name').focus();
      }
      event.preventDefault();
      return false;
    }
  };

  return ContactView;

})(ViewCollection);
});

;require.register("views/contact_name_modal", function(exports, require, module) {
var BaseView, CallImporterView, CallLogReader, ContactLogCollection, app,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

CallLogReader = require('lib/call_log_reader');

ContactLogCollection = require('collections/contactlog');

app = require('application');

module.exports = CallImporterView = (function(_super) {
  __extends(CallImporterView, _super);

  function CallImporterView() {
    this.close = __bind(this.close, this);
    return CallImporterView.__super__.constructor.apply(this, arguments);
  }

  CallImporterView.prototype.template = require('templates/name_modal');

  CallImporterView.prototype.id = 'namemodal';

  CallImporterView.prototype.tagName = 'div';

  CallImporterView.prototype.className = 'modal fade';

  CallImporterView.prototype.attributes = {
    tabindex: '-1'
  };

  CallImporterView.prototype.events = {
    'click #cancel-btn': 'close',
    'click #confirm-btn': 'save',
    'change input': 'refreshFN'
  };

  CallImporterView.prototype.afterRender = function() {
    return this.$el.modal('show');
  };

  CallImporterView.prototype.getRenderData = function() {
    return _.extend({}, this.model.attributes, {
      fn: this.model.getFN(),
      n: this.model.get('n') || this.model.getComputedN()
    });
  };

  CallImporterView.prototype.getStructuredName = function() {
    var fields;
    fields = ['last', 'first', 'middle', 'prefix', 'suffix'];
    return fields.map(function(field) {
      return $('#' + field).val();
    });
  };

  CallImporterView.prototype.save = function() {
    this.model.set('n', this.getStructuredName());
    this.model.set('fn', '');
    this.options.onChange();
    return this.close();
  };

  CallImporterView.prototype.refreshFN = function() {
    return this.$('#full').val(this.model.getComputedFN(this.getStructuredName()));
  };

  CallImporterView.prototype.close = function() {
    this.$el.modal('hide');
    return this.$el.on('hidden', (function(_this) {
      return function() {
        return _this.remove();
      };
    })(this));
  };

  return CallImporterView;

})(BaseView);
});

;require.register("views/contact_tags", function(exports, require, module) {
var BaseView, TagsView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

module.exports = TagsView = (function(_super) {
  __extends(TagsView, _super);

  function TagsView() {
    this.refresh = __bind(this.refresh, this);
    this.tagRemoved = __bind(this.tagRemoved, this);
    this.tagAdded = __bind(this.tagAdded, this);
    return TagsView.__super__.constructor.apply(this, arguments);
  }

  TagsView.prototype.initialize = function() {
    TagsView.__super__.initialize.apply(this, arguments);
    this.$el.tagit({
      availableTags: app.contacts.getTags() || [],
      placeholderText: t('add tags'),
      afterTagAdded: this.tagAdded,
      afterTagRemoved: this.tagRemoved
    });
    this.duringRefresh = false;
    $('.ui-widget-content .ui-autocomplete-input').keypress(function(event) {
      var keyCode;
      keyCode = event.keyCode || event.which;
      if (keyCode === 9) {
        return $('.zone .type').first().select();
      }
    });
    return this;
  };

  TagsView.prototype.tagAdded = function(e, ui) {
    if (!(this.duringRefresh || ui.duringInitialization)) {
      this.model.set('tags', this.$el.tagit('assignedTags'));
      this.options.onChange();
    }
    return ui.tag.click((function(_this) {
      return function() {
        var tagLabel;
        tagLabel = ui.tag.find('.tagit-label').text();
        $("#filterfield").val(tagLabel);
        $("#filterfield").trigger('keyup');
        return $(".dropdown-menu").hide();
      };
    })(this));
  };

  TagsView.prototype.tagRemoved = function(er, ui) {
    if (!(this.duringRefresh || ui.duringInitialization)) {
      this.model.set('tags', this.$el.tagit('assignedTags'));
      return this.options.onChange();
    }
  };

  TagsView.prototype.refresh = function() {
    var tag, _i, _len, _ref;
    this.duringRefresh = true;
    this.$el.tagit('removeAll');
    _ref = this.model.get('tags');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tag = _ref[_i];
      this.$el.tagit('createTag', tag);
    }
    return this.duringRefresh = false;
  };

  return TagsView;

})(BaseView);
});

;require.register("views/contactslist", function(exports, require, module) {
var App, ContactsList, ViewCollection,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ViewCollection = require('lib/view_collection');

App = require('application');

module.exports = ContactsList = (function(_super) {
  __extends(ContactsList, _super);

  function ContactsList() {
    this.onKeyUp = __bind(this.onKeyUp, this);
    this.keyUpCallback = __bind(this.keyUpCallback, this);
    this.onContactChanged = __bind(this.onContactChanged, this);
    this.getTags = __bind(this.getTags, this);
    return ContactsList.__super__.constructor.apply(this, arguments);
  }

  ContactsList.prototype.id = 'contacts-list';

  ContactsList.prototype.itemView = require('views/contactslist_item');

  ContactsList.prototype.template = require('templates/contactslist');

  ContactsList.prototype.events = {
    'change #filterfield': 'keyUpCallback',
    'click #filterClean': 'cleanFilter',
    "keyup": "onKeyUp"
  };

  ContactsList.prototype.initialize = function() {
    ContactsList.__super__.initialize.apply(this, arguments);
    return this.listenTo(this.collection, 'change', this.onContactChanged);
  };

  ContactsList.prototype.afterRender = function() {
    ContactsList.__super__.afterRender.apply(this, arguments);
    this.list = this.$('#contacts');
    this.filterfield = this.$('#filterfield');
    this.filterClean = this.$('#filterClean');
    this.filterClean.hide();
    this.filterfield.focus();
    this.list.niceScroll();
    this.filterfield.keyup(this.keyUpCallback);
    return this.filterfield.typeahead({
      source: this.getTags
    });
  };

  ContactsList.prototype.remove = function() {
    ContactsList.__super__.remove.apply(this, arguments);
    return this.list.getNiceScroll().remove();
  };

  ContactsList.prototype.appendView = function(view) {
    return this.list.append(view.$el);
  };

  ContactsList.prototype.activate = function(model) {
    var line, outofview, position;
    this.$('.activated').removeClass('activated');
    if (!model) {
      return;
    }
    line = this.views[model.cid].$el;
    line.addClass('activated');
    position = line.position().top;
    outofview = position < 0 || position > this.list.height();
    if (outofview) {
      this.list.scrollTop(this.list.scrollTop() + position);
    }
    return this.activatedModel = model;
  };

  ContactsList.prototype.cleanFilter = function(event) {
    var id, view, _ref, _results;
    event.preventDefault();
    this.filterfield.val('');
    this.filterClean.hide();
    _ref = this.views;
    _results = [];
    for (id in _ref) {
      view = _ref[id];
      _results.push(view.$el.show());
    }
    return _results;
  };

  ContactsList.prototype.getTags = function() {
    return this.collection.getTags();
  };

  ContactsList.prototype.onContactChanged = function(model) {
    this.views[model.cid].render();
    return this.activate(model);
  };

  ContactsList.prototype.keyUpCallback = function(event) {
    var filtertxt, firstmodel, id, match, view, _ref;
    if (event.keyCode === 27) {
      this.filterfield.val('');
      this.filterClean.hide();
      App.router.navigate("", true);
    }
    filtertxt = this.filterfield.val();
    this.filterClean.show();
    if (!(filtertxt.length > 1 || filtertxt.length === 0)) {
      return;
    }
    this.filterClean.toggle(filtertxt.length !== 0);
    filtertxt = filtertxt.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    this.filter = new RegExp(filtertxt, 'i');
    firstmodel = null;
    _ref = this.views;
    for (id in _ref) {
      view = _ref[id];
      match = (filtertxt === '0') || view.model.match(this.filter);
      view.$el.toggle(match);
      if (match && !firstmodel) {
        firstmodel = view.model;
      }
    }
    if (firstmodel && event.keyCode === 13) {
      return App.router.navigate("contact/" + firstmodel.id, true);
    }
  };

  ContactsList.prototype.onKeyUp = function(event) {
    var keyCode;
    if (this.activatedModel != null) {
      keyCode = event.keyCode;
      if (keyCode == null) {
        keyCode = event.which;
      }
      if (keyCode === 38) {
        this.onArrowUp(this.activatedModel);
      } else if (keyCode === 40) {
        this.onArrowDown(this.activatedModel);
      }
      event.preventDefault();
      return false;
    }
  };

  ContactsList.prototype.onArrowUp = function(contact) {
    var prevLine;
    prevLine = this.views[contact.cid].$el.prev();
    while (prevLine.length && prevLine.is(':hidden')) {
      prevLine = prevLine.prev();
    }
    if (prevLine.length) {
      return App.router.navigate(prevLine.attr('href'), true);
    }
  };

  ContactsList.prototype.onArrowDown = function(contact) {
    var nextLine;
    nextLine = this.views[contact.cid].$el.next();
    while (nextLine.length && nextLine.is(':hidden')) {
      nextLine = nextLine.next();
    }
    if (nextLine.length) {
      return App.router.navigate(nextLine.attr('href'), true);
    }
  };

  return ContactsList;

})(ViewCollection);
});

;require.register("views/contactslist_item", function(exports, require, module) {
var BaseView, ContactsListItemView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

module.exports = ContactsListItemView = (function(_super) {
  __extends(ContactsListItemView, _super);

  function ContactsListItemView() {
    return ContactsListItemView.__super__.constructor.apply(this, arguments);
  }

  ContactsListItemView.prototype.tagName = 'a';

  ContactsListItemView.prototype.className = 'contact-thumb';

  ContactsListItemView.prototype.attributes = function() {
    return {
      'href': "#contact/" + this.model.id
    };
  };

  ContactsListItemView.prototype.initialize = function() {
    return this.listenTo(this.model, 'change', this.render);
  };

  ContactsListItemView.prototype.getRenderData = function() {
    return _.extend({}, this.model.attributes, {
      hasPicture: this.model.hasPicture || false,
      bestmail: this.model.getBest('email'),
      besttel: this.model.getBest('tel'),
      fn: this.model.get('fn') || this.model.getComputedFN()
    });
  };

  ContactsListItemView.prototype.template = require('templates/contactslist_item');

  return ContactsListItemView;

})(BaseView);
});

;require.register("views/datapoint", function(exports, require, module) {
var BaseView, DataPointView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

module.exports = DataPointView = (function(_super) {
  __extends(DataPointView, _super);

  function DataPointView() {
    this.onKeyup = __bind(this.onKeyup, this);
    this.getPossibleTypes = __bind(this.getPossibleTypes, this);
    return DataPointView.__super__.constructor.apply(this, arguments);
  }

  DataPointView.prototype.template = require('templates/datapoint');

  DataPointView.prototype.tagName = 'li';

  DataPointView.prototype.className = 'datapoint';

  DataPointView.prototype.events = function() {
    return {
      'blur .type': 'store',
      'blur .value': 'store',
      'keyup .type': 'onKeyup',
      'keyup .value': 'onKeyup',
      'keydown .value': 'onValueKeyPress',
      'keydown .type': 'onTypeKeyPress',
      'click .dpremove': 'removeModel'
    };
  };

  DataPointView.prototype.getRenderData = function() {
    return _.extend(this.model.toJSON(), {
      placeholder: this.getPlaceHolder()
    });
  };

  DataPointView.prototype.afterRender = function() {
    this.valuefield = this.$('.value');
    this.typefield = this.$('input.type');
    this.actionLink = this.$('.dpaction');
    this.typefield.typeahead({
      source: this.getPossibleTypes
    });
    return this.makeActionLink();
  };

  DataPointView.prototype.getPossibleTypes = function() {
    switch (this.model.get('name')) {
      case 'about':
        return ['org', 'birthday', 'title'];
      case 'other':
        return ['skype', 'jabber', 'irc'];
      case 'url':
        return ['facebook', 'google', 'website'];
      default:
        return ['main', 'home', 'work', 'assistant'];
    }
  };

  DataPointView.prototype.getPlaceHolder = function() {
    switch (this.model.get('name')) {
      case 'email':
        return 'john.smith@example.com';
      case 'adr':
        return '42 main street ...';
      case 'tel':
        return '+33 1 23 45 67 89';
      case 'url':
        return 'http://example.com/john-smith';
      case 'about':
      case 'other':
        return t('type here');
    }
  };

  DataPointView.prototype.makeActionLink = function() {
    var action, href, value;
    action = (function(_this) {
      return function(icon, title, href, noblank) {
        if (!_this.actionLink.parent()) {
          _this.$el.append(_this.actionLink);
        }
        _this.actionLink.attr({
          title: title,
          href: href
        });
        if (noblank) {
          _this.actionLink.removeAttr('target');
        } else {
          _this.actionLink.attr('target', '_blank');
        }
        return _this.actionLink.find('i').addClass('icon-' + icon);
      };
    })(this);
    value = this.model.get('value');
    switch (this.model.get('name')) {
      case 'email':
        return action('envelope', 'send mail', "mailto:" + value, true);
      case 'tel':
        href = this.callProtocol() + ':+' + value;
        return action('headphones', 'call', href, true);
      case 'url':
        return action('share', 'go to this url', "" + value, false);
      case 'other':
        if (this.model.get('type') === 'skype') {
          return action('headphones', 'call', "callto:" + value);
        }
        break;
      default:
        return this.actionLink.detach();
    }
  };

  DataPointView.prototype.callProtocol = function() {
    if (navigator.userAgent.match(/(mobile)/gi)) {
      return 'tel';
    } else {
      return 'callto';
    }
  };

  DataPointView.prototype.onKeyup = function(event) {
    var backspace, empty;
    empty = $(event.target).val().length === 0;
    backspace = (event.which || event.keyCode) === 8;
    if (!backspace) {
      this.secondBack = false;
      return true;
    }
    if (!empty) {
      return true;
    }
    if (this.secondBack) {
      return (function(_this) {
        return function() {
          var prev;
          prev = _this.$el.prev('li').find('.value');
          _this.removeModel();
          if (prev) {
            return prev.focus().select();
          }
        };
      })(this);
    } else {
      return this.secondBack = true;
    }
  };

  DataPointView.prototype.removeModel = function() {
    return this.model.collection.remove(this.model);
  };

  DataPointView.prototype.store = function() {
    return this.model.set({
      value: this.valuefield.val(),
      type: this.typefield.val()
    });
  };

  DataPointView.prototype.onTypeKeyPress = function(event) {
    var keyCode, prev;
    keyCode = event.keyCode;
    if (keyCode == null) {
      keyCode = event.which;
    }
    if (keyCode === 9) {
      if (event.shiftKey) {
        prev = this.$el.prev();
        if (prev.length === 0) {
          prev = this.$el.parent().parent();
          prev = prev.prev();
          while (!prev.is(':visible') && prev.length > 0) {
            prev = prev.prev();
          }
          if (prev.length === 0) {
            prev = $(".ui-widget-content");
          } else {
            prev = prev.find('.value');
          }
        } else {
          prev = prev.find('.value');
        }
        prev.focus();
        prev.select();
      } else {
        $(event.target).next().focus();
      }
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  };

  DataPointView.prototype.onValueKeyPress = function(event) {
    var keyCode, next;
    keyCode = event.keyCode;
    if (keyCode == null) {
      keyCode = event.which;
    }
    if (keyCode === 9) {
      if (event.shiftKey) {
        $(event.target).prev().focus();
      } else {
        next = this.$el.next();
        if (next.length === 0) {
          next = this.$el.parent().parent();
          next = next.next();
          while (!next.is(':visible') && (next.attr('id') != null)) {
            next = next.next();
          }
          if (next.attr('id') == null) {
            next = $("textarea#notes");
          } else {
            next = next.find('.type');
          }
        } else {
          next = next.find('.type');
        }
        next.focus();
        next.select();
      }
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  };

  return DataPointView;

})(BaseView);
});

;require.register("views/doc", function(exports, require, module) {
var BaseView, DocView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

module.exports = DocView = (function(_super) {
  __extends(DocView, _super);

  function DocView() {
    return DocView.__super__.constructor.apply(this, arguments);
  }

  DocView.prototype.id = 'doc';

  DocView.prototype.template = require('templates/doc');

  DocView.prototype.events = {
    'change #nameFormat': 'saveNameFormat'
  };

  DocView.prototype.afterRender = function() {
    if (app.config.get('nameOrder') !== 'not-set') {
      this.$('#config-now').hide();
      return this.$('#nameFormat').val(app.config.get('nameOrder'));
    } else if (app.contacts.length === 0) {
      return this.$('#config-now').hide();
    }
  };

  DocView.prototype.saveNameFormat = function() {
    var help;
    help = this.$('.help-inline').show().text(t('saving'));
    return app.config.save({
      nameOrder: this.$('#nameFormat').val()
    }, {
      wait: true,
      success: function() {
        help.text(t('saved')).fadeOut();
        return window.location.reload();
      },
      error: function() {
        return help.addClass('error').text(t('server error occured'));
      }
    });
  };

  return DocView;

})(BaseView);
});

;require.register("views/history", function(exports, require, module) {
var ContactLog, HistoryView, ViewCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ViewCollection = require('lib/view_collection');

ContactLog = require('models/contactlog');

module.exports = HistoryView = (function(_super) {
  __extends(HistoryView, _super);

  function HistoryView() {
    return HistoryView.__super__.constructor.apply(this, arguments);
  }

  HistoryView.prototype.tagName = 'div';

  HistoryView.prototype.itemView = require('views/history_item');

  HistoryView.prototype.events = function() {
    return {
      'mouseenter': 'showInjector',
      'mouseleave': 'hideInjector',
      'mouseover td': 'moveInjector',
      'click #inject-note': 'injectNote'
    };
  };

  HistoryView.prototype.afterRender = function() {
    HistoryView.__super__.afterRender.apply(this, arguments);
    this.collection.fetch();
    return this.injector = this.$('.injector').hide();
  };

  HistoryView.prototype.showInjector = function() {
    return this.injector.show();
  };

  HistoryView.prototype.hideInjector = function() {
    return this.injector.hide();
  };

  HistoryView.prototype.moveInjector = function(event) {
    var tr;
    tr = $(event.target).parents('tr');
    if (tr.hasClass('injector')) {
      return;
    }
    if (this.injector.parent()) {
      this.injector.detach();
    }
    if (tr.hasClass('annotable')) {
      return tr.after(this.injector);
    }
  };

  HistoryView.prototype.injectNote = function() {
    var afterLog;
    afterLog = this.collection.at(this.injector.index() - 1);
    this.note = new ContactLog({
      type: 'NOTE',
      direction: 'NA',
      content: '',
      timestamp: afterLog.get('timestamp')
    });
    this.collection.add(this.note);
    this.injector.after(this.views[this.note.cid].$el.detach());
    return this.injector.detach();
  };

  HistoryView.prototype.formComplete = function() {
    return this.injector = this.clone;
  };

  return HistoryView;

})(ViewCollection);
});

;require.register("views/history_item", function(exports, require, module) {
var BaseView, HistoryItemView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

module.exports = HistoryItemView = (function(_super) {
  __extends(HistoryItemView, _super);

  function HistoryItemView() {
    return HistoryItemView.__super__.constructor.apply(this, arguments);
  }

  HistoryItemView.prototype.template = require('templates/history_item');

  HistoryItemView.prototype.className = function() {
    var classes;
    classes = ['history_item'];
    classes.push(this.model.get('direction').toLowerCase());
    classes.push(this.model.get('type').toLowerCase());
    if (this.isAnnotable()) {
      classes.push('annotable');
    }
    return classes.join(' ');
  };

  HistoryItemView.prototype.events = {
    'blur .editor': 'save',
    'click .notedelete': 'delete'
  };

  HistoryItemView.prototype.getRenderData = function() {
    var format;
    format = '{Mon} {d}, {h}:{m} : ';
    return {
      typeIcon: this.getTypeIcon(),
      content: this.getContent(),
      date: Date.create(this.model.get('timestamp')).format(format)
    };
  };

  HistoryItemView.prototype.isAnnotable = function() {
    return this.model.get('type') === 'VOICE';
  };

  HistoryItemView.prototype.save = function() {
    return this.model.save({
      content: this.editor.val()
    });
  };

  HistoryItemView.prototype["delete"] = function() {
    return this.model.destroy();
  };

  HistoryItemView.prototype.getDirectionIcon = function() {
    switch (this.model.get('direction')) {
      case 'INCOMING':
        return 'icon-forward';
      case 'OUTGOING':
        return 'icon-backward';
      default:
        return false;
    }
  };

  HistoryItemView.prototype.getTypeIcon = function() {
    switch (this.model.get('type')) {
      case 'VOICE':
        return 'icon-voice';
      case 'MAIL':
        return 'icon-mail';
      case 'SMS':
        return 'icon-sms';
      default:
        return 'icon-stop';
    }
  };

  HistoryItemView.prototype.getContent = function() {
    var content, details;
    details = this.model.get('content');
    switch (this.model.get('type')) {
      case 'VOICE':
        content = this.model.get('direction') === 'OUTGOING' ? t('you called') : t('you were called');
        return content + (" (" + (this.formatDuration(details.duration)) + ")");
      case 'SMS':
        return details.message;
      default:
        return '???';
    }
  };

  HistoryItemView.prototype.formatDuration = function(duration) {
    var hours, minutes, out, seconds;
    seconds = duration % 60;
    minutes = (duration - seconds) % 3600;
    hours = duration - minutes - seconds;
    out = seconds + t('seconds');
    if (minutes) {
      out = minutes / 60 + t('minutes') + ' ' + out;
    }
    if (hours) {
      out = hours / 3600 + t('hours') + ' ' + out;
    }
    return out;
  };

  return HistoryItemView;

})(BaseView);
});

;require.register("views/importer", function(exports, require, module) {
var BaseView, Contact, ImporterView, app,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

BaseView = require('lib/base_view');

Contact = require('models/contact');

app = require('application');

module.exports = ImporterView = (function(_super) {
  __extends(ImporterView, _super);

  function ImporterView() {
    return ImporterView.__super__.constructor.apply(this, arguments);
  }

  ImporterView.prototype.template = require('templates/importer');

  ImporterView.prototype.id = 'importer';

  ImporterView.prototype.tagName = 'div';

  ImporterView.prototype.className = 'modal';

  ImporterView.prototype.events = function() {
    return {
      'change #vcfupload': 'onupload',
      'click  #confirm-btn': 'addcontacts'
    };
  };

  ImporterView.prototype.afterRender = function() {
    this.$el.modal();
    this.upload = this.$('#vcfupload')[0];
    this.content = this.$('.modal-body');
    return this.confirmBtn = this.$('#confirm-btn');
  };

  ImporterView.prototype.onupload = function() {
    var file, reader, validMimeTypes, _ref;
    file = this.upload.files[0];
    validMimeTypes = ['text/vcard', 'text/x-vcard', 'text/directory', 'text/directory;profile=vcard'];
    if (_ref = file.type.toLowerCase(), __indexOf.call(validMimeTypes, _ref) < 0) {
      this.$('.control-group').addClass('error');
      this.$('.help-inline').text(t('is not a vCard'));
      return;
    }
    reader = new FileReader();
    reader.readAsText(file);
    return reader.onloadend = (function(_this) {
      return function() {
        var txt;
        _this.toImport = Contact.fromVCF(reader.result);
        txt = t('import.ready-msg', {
          smart_count: _this.toImport
        });
        txt = "<p>" + txt + " :</p><ul>";
        _this.toImport.each(function(contact) {
          var name;
          name = contact.get('fn') || contact.getComputedFN();
          return txt += "<li>" + name + "</li>";
        });
        txt += '</ul>';
        _this.content.html(txt);
        return _this.confirmBtn.removeClass('disabled');
      };
    })(this);
  };

  ImporterView.prototype.addcontacts = function() {
    if (!this.toImport) {
      return true;
    }
    this.toImport.each(function(contact) {
      return contact.save(null, {
        success: function() {
          return app.contacts.add(contact);
        }
      });
    });
    return this.close();
  };

  ImporterView.prototype.close = function() {
    this.$el.modal('hide');
    return this.remove();
  };

  return ImporterView;

})(BaseView);
});

;require.register("widget", function(exports, require, module) {
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = {
  initialize: function() {
    var Config, ContactsCollection, ContactsList, Router, e, homeGoTo, locales, router;
    window.app = this;
    homeGoTo = function(url) {
      var intent;
      intent = {
        action: 'goto',
        params: url
      };
      return window.parent.postMessage(intent, window.location.origin);
    };
    this.locale = window.locale;
    delete window.locale;
    this.polyglot = new Polyglot();
    try {
      locales = require('locales/' + this.locale);
    } catch (_error) {
      e = _error;
      locales = require('locales/en');
    }
    this.polyglot.extend(locales);
    window.t = this.polyglot.t.bind(this.polyglot);
    Router = (function(_super) {
      __extends(Router, _super);

      function Router() {
        return Router.__super__.constructor.apply(this, arguments);
      }

      Router.prototype.routes = {
        '': function() {},
        '*redirect': 'redirect'
      };

      Router.prototype.redirect = function(path) {
        this.navigate('#', {
          trigger: true
        });
        return homeGoTo('contacts/' + path);
      };

      return Router;

    })(Backbone.Router);
    Config = require('models/config');
    this.config = new Config(window.config || {});
    ContactsCollection = require('collections/contact');
    ContactsList = require('views/contactslist');
    this.contacts = new ContactsCollection();
    this.contactslist = new ContactsList({
      collection: this.contacts
    });
    this.contactslist.$el.addClass('contact-widget');
    this.contactslist.$el.appendTo($('body'));
    this.contactslist.render();
    this.contacts.reset(window.initcontacts, {
      parse: true
    });
    delete window.initcontacts;
    router = new Router();
    return Backbone.history.start();
  }
};
});

;
//# sourceMappingURL=app.js.map