var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stylus = require('stylus');

var nconf = require('nconf').file({file: 'config.json'});

var routes = require('./routes/index');
var users = require('./routes/users');
var gameboard = require('./routes/gameboard');

var app = express();

app.config = nconf;

var mongoose = require('mongoose');
var db = mongoose.connection;

var gameBoardSchema = new mongoose.Schema({
    _id : String
});

var gameBoardModel = mongoose.model('gameBoard', gameBoardSchema);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(stylus.middleware({
    src: __dirname + '/assets',
    dest:__dirname + '/public',
    force: true,
    debug: true,
    compile: function(str, path) {
        return stylus(str).set('filename', path).set('compress', true);
    }
}));


// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/gameboard', gameboard);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {

    db.on('error', console.error);
    db.once('open', function() {
        console.log("Connected to '" + nconf.get("mongo").database + "' database");

        gameBoardModel.find({}, function (err, item) {
            if (err) console.log(err);
        });

        // db.collection("gameBoard", {strict:true}, function(err, collection) {
        //     if (err) throw err;
        //     console.log('gameBoard collection exists...');
        //     collection.find().toArray(function (err, items) {
        //         if (items.length == 0) {
        //             console.log("Empty collection");
        //         }
        //     });
        // });
    });
    mongoose.connect("mongodb://" + nconf.get("mongo").user + ":" + nconf.get("mongo").password + "@" + nconf.get("mongo").host + ":" + nconf.get("mongo").port + "/" + nconf.get("mongo").database);

    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
