## What's this?

HelloWorld is a single-page web application built with NodeJS, Express.js and 
the MongoDB NoSQL database and Mongoose (amongst other libraries).


* node - async server framework using on Google Chrome V8 core
* express - server-side framework based on node. simplifies http server and RESTful apis
* underscore - util library
* MongoDB and mongoose library


## Quick start

- Make sure Node.js and NPM should be installed. This project was developed on Node 0.8.x.
- Install project dependency modules on the server with NPM by running the following command in the terminal (project root):

    npm install xyz
    e.g. npm install express

- Configure the ports for the application (for multiple environments: dev, test, production) 
  and also the settings for the MongoDB connection (you can either host MongoDB locally or try 
  a free hosting provider such as MongoLab). The config data is in /config

- Start the server:

  a) Production

    npm start 

  b) Development (note that if you want to load all the files uncompressed you should visit http://<server>:<port>/dev.html)


  start mongo

  open another shell window and start node.js
  $ node app.js    
    
  then open your browser and go to localhost:8080 which should display the rendered public website

## App structure

The application has a structure similar to Rails:

- the model and controller folders are within '/app'
- the configuration stored into json files in '/config'.
- public directory for the server: '/public'
- logs are kept into their own '/logs' folder, having one file per environment
- '/lib' is where application specific files reside
- all backend test files are inside '/test', structured into: unit tests ('/unit'), 
  functional tests ('/functional') and the fixtures
- the Jakefile: similar to make or rake, can run tasks

Frontend:

- the '/js' folder is where the 'magic' happens: '/main.js' is the starting point 
  (stores RequireJS configuration), which calls '/app' (that deals with the initialization 
  for the application), the rest of the foldes are self-explanatory
- '/css' and '/img' stores the static stylesheets and images needed
- '/test' has the logic for the test runner (with Mocha), and specs
- The views use the Underscore.js  _.template library to render html



## Small JS styleguide for the project

- 2 spaces for indentation
- Semicolons should be used
- Line length should be 80 (that's a soft limit, 82-83 for example is ok provided these are just a few exceptions)
- Braces go on the same line as the statement
- Vars should always be declared at the top
- Variables and properties should use lower camel case capitalization

- http://http://howtonode.org

