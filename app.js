
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var logger  = require('morgan');
var favicon = require('serve-favicon');
var http = require('http');
var path = require('path');
var nconf = require('nconf').file({file: 'config.json'});

var mongo = require('mongoose');
var db = mongo.db("mongodb://" + nconf.get("mongo").host + ":" + nconf.get("mongo").port + "/" + nconf.get("mongo").database, {native_parser:true})

db.open(function(err, db) {
	if (err) throw err;

    console.log("Connected to '" + nconf.get("mongo").database + "' database");
    db.collection(nconf.get("mongo").collection, {strict:true}, function(err, collection) {
        if (err) throw err;
        console.log('Collection exists...');
        collection.find().toArray(function (err, items) {
        	if (items.length == 0) {
        		console.log("Empty collection");
        	}
        });
    });
});

var app = express();

// all environments
app.set('port', process.env.PORT || nconf.get("http").port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
//app.use(bodyParser({ keepExtensions: true, uploadDir: __dirname + '/tmp' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());

//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.get('/', routes.index(db));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});