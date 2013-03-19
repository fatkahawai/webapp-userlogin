/**
 * users_controller.js
 * 
 * @version 1.0
 * 
 * DESCRIPTION:
 * server-side MVC Controller for the Users class
 * This module handles the API requests from web clients related to users
 * sets up the express Routes for the get/put/post/deletes for /users,
 * which is a request like 'GET <url>/users?arg=something'
 * 
 * it uses the methods of the User model in models/user.js to read and write users data
 *  
 * This is server-side JavaScript, intended to be run with Express on NodeJS.
 * it uses Mongoose library for MongoDB
 * 
 * @throws none
 * @see 
 * 
 * @author Bob Drummond
 * (C) 2013 PINK PELICAN NZ LTD
 */

var v1       = '/api/v1',                    // versioning for the APIs
    utils    = require('../../lib/utils'),
    log      = require('../../lib/logger'),
    _        = require('underscore'),
    NotFound = utils.NotFound,
    checkErr = utils.checkErr,
    UsersController;

UsersController = function(app, mongoose, config) {

  var User = mongoose.model('User');

/*
 * GET (all users)
 */
  app.get(v1 + '/users', function index(req, res, next) {
    log.info('users_controller.js: GET all users');

    User.search(req.query, function(err, users) {
      log.info('users_controller.js: loaded '+users.length+' users');
      checkErr(
        next,
        [{ cond: err }],
        function() {
          // TODO: finish etag support here, check for If-None-Match
          res.header('ETag', utils.etag(users));
          res.json(users);
        }
      );
    });
  });

/*
 * GET (a user)
 */
  app.get(v1 + '/users/:id', function show(req, res, next) {
    log.info('users_controller.js: GET a user: '+req.params.id);

    User.findById(req.params.id, function(err, user) {
      checkErr(
        next,
        [{ cond: err }, { cond: !user, err: new NotFound('json') }],
        function() {
          // TODO: finish etag support here, check for If-None-Match
          res.header('ETag', utils.etag(user));
          res.json(user);
        }
      );
    });
  });

/*
 * POST - create user
 */
  app.post(v1 + '/users', function create(req, res, next) {
    var newUser;
    log.info('users_controller.js: POST to create a user');

    // disallow other fields besides those listed below
    newUser = new User(_.pick(req.body, 'userName', 'password', 'isAdmin', 'fullName', 'email', 'dateRegistered', 'born', 
                       'country', 'city', 'timezone'));
    log.debug('users_controller.js: saving new user');
    newUser.save(function(err) {
      var errors, code = 200, loc;

      if (!err) {
        loc = config.site_url + v1 + '/users/' + newUser._id;
        log.debug('users_controller.js: saved new user OK, sending response: '+loc);
        res.setHeader('Location', loc);
        res.json(newUser, 201);
      } else {
        errors = utils.parseDbErrors(err, config.error_messages);
        if (errors.code) {
          code = errors.code;
          delete errors.code;
          log.info(err);
        }
        log.info('users_controller.js: couldnt save new user, sending response '+errors);
        res.json(errors, code);
      }
    });
  });

/*
 * POST - authenticate a user
 * If valid, it fills out the user details on the session, sets a unique sessionID and removes the password 
 * and then sends back the result.
 */
  app.post(v1 + '/user/signin', function create(req, res, next) {
    log.debug('users_controller.js: POST to authenticate a user');

    log.debug('users_controller.js: searching for user, using req.body.userName= '+req.body.userName);

    User.search(req.body, function(err, users) {
      log.debug('users_controller.js: loaded '+users.length+' users who match username '+req.body.userName);
      if ( users.length == 1 ) {
        if ( users[0].password == req.body.password ) {
          // TODO: use connect session and cookie management to manage the sessions once authenticated
          
          // HTTP 201 = The request has been fulfilled and resulted in a new resource being created
          res.json(201, {userName: users[0].userName});  
        }
        else{
          log.debug('users_controller.js: password not correct');
          res.send(401);  // HTTP 401 = unauthorized 
        }
      }
      else{
        log.debug('users_controller.js: user not found');
        res.send(401);  // HTTP 401 = unauthorized 
      }
    }); // User.search
  }); // app.post

/*
 * PUT - update a user data
 */
  app.put(v1 + '/users/:id', function update(req, res, next) {
    log.info('users_controller.js: PUT to modify a user');
    
    User.findById(req.params.id, function(err, user) {
      checkErr(
        next,
        [{ cond: err }, { cond: !user, err: new NotFound('json') }],
        function() {
          var newAttributes;

          // modify resource with allowed attributes
          newAttributes = _.pick(req.body, 'userName', 'password', 'isAdmin', 'fullName', 'email', 'dateRegistered', 'born', 
                       'country', 'city', 'timezone');
          user = _.extend(user, newAttributes);

          user.save(function(err) {
            var errors, code = 204;

            if (!err) {
              // send 204 No Content
              log.debug('users_controller.js: #PUT: save was ok, sending 204 no content');
              res.send(204);
            } else {
              log.debug('users_controller.js: #PUT: save failed. parsing Db error err.name= '+err.name);
              errors = utils.parseDbErrors(err, config.error_messages);
              log.debug('users_controller.js: #PUT: errors.code= '+errors.code);
              
              if (errors.code) {
                code = errors.code;
                delete errors.code;
                log.debug("users_controller.js: PUT error "+err);
              }
              log.debug("users_controller.js: PUT error - sending error response");
              res.json(errors, code);
              log.debug("users_controller.js: PUT - returning");
            }
          });
        }
      );
    });
  });

/*
 * DEL - remove a user
 */
  app.del(v1 + '/users/:id', function destroy(req, res, next) {
    log.info('users_controller.js: DEL a user');
    User.findById(req.params.id, function(err, user) {
      checkErr(
        next,
        [{ cond: err }, { cond: !user, err: new NotFound('json') }],
        function() {
          user.remove();
          res.json({});
        }
      );
    });
  });

};

module.exports = UsersController;
