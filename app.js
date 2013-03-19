/**
 * app.js
 * 
 * @version 1.0
 * 
 * DESCRIPTION:
 * Core module for a "HELLO WORLD" server-side application.
 * 
 * This is server-side JavaScript, intended to be run with Express on NodeJS using MongoDB NoSQL Db for persistence.
 * 
 * @throws none
 * @see 
 * 
 * @author Bob Drummond
 * (C) 2013 PINK PELICAN NZ LTD
 */

// var DEBUG=true;

var connect        = require('connect'),
    express        = require('express'),
    connectTimeout = require('connect-timeout'),
    mongoose       = require('mongoose'),
    utils          = require('./lib/utils'),
    log            = require('./lib/logger'),
    EventEmitter   = require('events').EventEmitter,
    AppEmitter     = new EventEmitter(),
    app            = express.createServer(), // or has been deprecated the error msg says, 
    ENV            = process.env.NODE_ENV || 'development',
    dbPath;

log.info('nodejs application started. NODE_ENV= '+process.env.NODE_ENV);
 
utils.loadConfig(__dirname + '/config', function(config) {
  app.use(function(req, res, next) {
    res.removeHeader('X-Powered-By');
    next();
  }); // app.use()
  
  app.configure(function() {
    utils.ifEnv('development', function() {
      log.debugOn(); // enable logging of also debug-level traces
    });
    
    app.use(express.favicon());
    app.use(express['static'](__dirname + '/public'));  // to serve files
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    utils.ifEnv('production', function() {
      app.use(connectTimeout({
        time: parseInt(config[ENV].REQ_TIMEOUT, 10)
      }));
    }); // utils.ifEnv()
  }); // app.configure()

  if (!(mongoose = utils.connectToDatabase(mongoose, config.db[ENV].main))){
    log.err('app.js: Unable to connect to MongoDB');
  } // if
  else log.info('app.js: connected to MongoDB '+ENV+' environment');

  // register models
  // <TODO add all your models>
  require('./app/models/user')(mongoose);
  log.debug('app.js: registered all models');

  // register controllers
  // <TODO add all controllers>
  ['users','logs','errors'].forEach(function(controller) {
    require('./app/controllers/' + controller + '_controller')(app, mongoose, config);
    log.debug('app.js: registered controller '+controller);
  }); // .forEach()
  log.info('app.js: registered all controllers');
 
  app.on('error', function (e) {
    if (e.code == 'EADDRINUSE') {
      log.info('Address in use, retrying...');
      
      setTimeout(function () {
        app.close();
        app.listen(config[ENV].PORT, function() {
          app.serverUp = true;
        });
      }, 1000);
      
    } // if
  }); // app.on()

  if (!module.parent) {
    app.listen(config[ENV].PORT, function() {
      app.serverUp = true;
      log.info('app.js: server is running');
    });
    log.info('\n-------\nExpress server listening on port '+config[ENV].PORT+', environment: '+ENV+'\n-------');
  } // if

  AppEmitter.on('checkApp', function() {
    AppEmitter.emit('getApp', app);
  });
  log.debug('app.js: utils.loadConfig returning');
}); // utils.loadConfig()

/**
 * export AppEmitter for external services so that the callback can execute
 * when the app has finished loading the configuration
 */
module.exports = AppEmitter;
