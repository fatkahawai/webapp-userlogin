/**
 * router.js
 * 
 * @version 1.0
 * 
 * DESCRIPTION:
 * backbone Router module for the CLIENT-side application .
 * uses backbone.js MVC framework, which depends on the underscore.js utility library.
 * 
 * @throws none
 * @see 
 * 
 * @author Bob Drummond
 * (C) 2013 PINK PELICAN NZ LTD
 */

define('Router', [
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'myassert',
  'logToServer',
  // === VIEWS ===
  'HomeView',
  'HeaderView',
  // TODO: add class name of other views here
  'AboutView',
  'SigninView',
  'ContactView',
  
  'UserListView',
  'UserView',
  'UserEditView',
  'UserModel'
], function($, _, Backbone, moment, myassert, logToServer,
            HomeView, HeaderView, 
            // TODO: add class name of any other views here
            AboutView, SigninView, ContactView,
            UserListView, UserView, UserEditView, User
            ) {
  var AppRouter, initialize;

  AppRouter = Backbone.Router.extend({
    routes: {
    // URL route       : function to call
    // ----------------------------------
      ''               : 'home',           // <url> or <url>/# or <url>/home opens our home page
      'home'           : 'home',
      
      // <TODO - add routes for any other views here

// ADMIN MENU
      'users'          : 'showUsers',      // show list of all users  <host>/#/users
      'users/new'      : 'addUser',
      'users/:id'      : 'showUser',
      'users/:id/edit' : 'editUser',

// MISC MENU ITEMS and Footer links
      'options'        : 'showOptions',
      'signin'         : 'showSignin',     // open log in dialog
      'profile'        : 'showProfile',    // open my profile dialog
      'signout'        : 'showSignout',    // log out current user
      'about'          : 'showAbout',      // open About dialog
      
      'contact'        : 'showContact',    // open Contact Us dialog
      'terms'          : 'showTerms',
      'privacy'        : 'showPrivacy',

      // any other action defaults to the following handler
      '*actions'    : 'defaultAction'
    }, // routes
    
    initialize: function() {// TODO use connect lib to manage sessions and cookies 
    window.activeSession = { 'isLoggedIn':false ; 'isAdmin':false; 'userName':''});
      if (DEBUG) console.log('router.js: initialized session (!isLoggedIn and !isAdmin)');

      
      this.userView = {};
      this.userEditView = {};
      this.headerView = new HeaderView();
      if (DEBUG) console.log('router.js: instantiated all Views');

      // cached elements
      this.elms = {
        'page-content': $('.page-content') // the class of the main section in index.html
      };
      var d = moment();
      console.log( 'calendar = '+d.calendar());
      myassert.ok( this.elms, 'router.js: initialize: can\'t find the id=#page-content element');
      
      $('header').hide().html(this.headerView.render().el).fadeIn('slow');
      $('footer').fadeIn('slow');
    }, // initialize

/*
 * HOME MENU ITEM 
 */
    home: function() {
      if(DEBUG) console.log('router.js: home');
      
      this.headerView.select('home-menu');

      if (!this.homeView) {
        this.homeView = new HomeView();
      }
      this.elms['page-content'].html(this.homeView.render().el);
    }, //home


/*
 * ADMIN MENU USERS COMMAND HANDLERS
 */
    showUsers: function() {
      var that = this;
      if(DEBUG) console.log('router.js: showUsers');
      
      this.headerView.select('admin-menu'); // highlight the selected menu item 

      if (!this.userListView) {
        this.userListView = new UserListView();
      }
      this.userListView.render(function() {
        that.elms['page-content'].html(that.userListView.el);
      });
    }, // showUsers
    
    showUser: function(id) {
      var that = this, view;
      if(DEBUG) console.log('router.js: showUser: '+id);

      this.headerView.select('admin-menu');

      // pass _silent to bypass validation to be able to fetch the model
      model = new User({ _id: id, _silent: true });
      model.fetch({
        success : function(model) {
          if(DEBUG) console.log('router.js: fetched user: '+id);
          model.unset('_silent');

          view = new UserView({ model: model });
          that.elms['page-content'].html(view.render().el);
          view.model.on('delete-success', function() {
            delete view;
            that.navigate('users', { trigger: true });
          });
        }, // success
        
        error   : function(model, res) {
          if(DEBUG) console.log('router.js: showUser: fetch failed for user: '+id);
          if (res.status === 404) {
            // TODO: handle 404 Not Found
            if(DEBUG) console.log('router.js: showUser: - received a 404 not found from server');
          } else if (res.status === 500) {
            // TODO: handle 500 Internal Server Error
            if(DEBUG) console.log('router.js: showUser: - received a 500 internal server error from server');
          }
        } // error
      }); //model.fetch
    }, // showUser
    
    addUser: function() {
      var that = this, model, view;
      if(DEBUG) console.log('router.js: addUser');

      this.headerView.select('admin-menu');

      model = new User();
      view  = new UserEditView({ model: model });

      this.elms['page-content'].html(view.render().el);
      view.on('back', function() {
        delete view;
        that.navigate('#/users', { trigger: true });
      });
      view.model.on('save-success', function(id) {
        delete view;
        that.navigate('#/users/' + id, { trigger: true });
      });
    }, // addUser
    
    editUser: function(id) {
      var that = this, model, view;
      if(DEBUG) console.log('router.js: editUser');

      this.headerView.select('admin-menu');

      // pass _silent to bypass validation to be able to fetch the model
      model = new User({ _id: id, _silent: true });
      model.fetch({
        success : function(model) {
          model.unset('_silent');

          // Create & render view only after model has been fetched
          view = new UserEditView({ model: model });
          that.elms['page-content'].html(view.render().el);
          view.on('back', function() {
            delete view;
            that.navigate('#/users/' + id, { trigger: true });
          });
          view.model.on('save-success', function() {
            delete view;
            that.navigate('#/users/' + id, { trigger: true });
          });
        }, // success
        error   : function(model, res) {
          if (res.status === 404) {
            // TODO: handle 404 Not Found
            if(DEBUG) console.log('router.js: editUser: fetch failed - 404 not found');
          } else if (res.status === 500) {
            // TODO: handle 500 Internal Server Error
            if(DEBUG) console.log('router.js: editUser: fetch failed - 500 internal server error');
          }
        } // error
      }); // model.fetch
    }, // editUser
    


/*
 * SETTINGS MENU COMMAND HANDLERS
 */
    showOptions: function() {      // TODO: complete this
      if(DEBUG) console.log('router.js: showOptions');
    }, // showOptions

    showProfile: function() {      // TODO: complete this
      if(DEBUG) console.log('router.js: showProfile');
    }, // showProfile

    showSignin: function() {
      if(DEBUG) console.log('router.js: showSignin');
      
      // open a modal dialog
      if (!this.signinView) {
        this.signinView = new SigninView();
      }
      this.signinView.render();
    }, // showSignin
    
    showSignout: function() {  // TODO: complete this
      if(DEBUG) console.log('router.js: showSignout');
      window.activeSession.isLoggedIn = false ;
      window.activeSession.isAdmin = false ;
      window.activeSession.userName = '' ;
      
    }, // showSignout

/*
 * MISC MENU ITEM COMMAND HANDLERS
 */
    showAbout: function() {
      if(DEBUG) console.log('router.js: showAbout');
      
      var activeMenu = this.headerView.currentActive();
      if(DEBUG) console.log('router.js: showAbout. activeMenu= '+activeMenu);

      // open a modal dialog
      if (!this.aboutView) {
        this.aboutView = new AboutView();
      }
      this.aboutView.render();

    }, // showAbout

    showContact: function() {
      var that = this;
      if(DEBUG) console.log('router.js: showContact');
      

//      this.headerView.select('contact-menu'); // highlight the selected menu item 
      
      // don't open a new page, just replace the content section on our page with the contact.html content       
      // or  use backbone.bootstrap-model library to open a modal dialog

//      that.elms['page-content'].html('<p>default</p>'); // remove the previous content section to be sure its gone?

      if (!this.contactView) {
        this.contactView = new ContactView();
      }
      // this works
      this.elms['page-content'].html(this.contactView.render().el);
/*    but this original code doesn't....
        this.contactView.render(function() {
        that.elms['page-content'].html(that.contactView.el);
      });
*/
    }, // showContact

    showTerms: function() {  // TODO: complete this
      if(DEBUG) console.log('router.js: showTerms');
    }, // showTerms

    showPrivacy: function() {  // TODO: complete this
      if(DEBUG) console.log('router.js: showPrivacy');
    }, // showPrivacy
    
    defaultAction: function(actions) {
      // No matching route, log the route?
      console.log('router.js: unmatched route. action='+actions);
//      Backbone.history.navigate('');
    }
  }); // Backbone.Router.extend

  return AppRouter;
}); // define
