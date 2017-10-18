var express         = require('express'),
    path            = require('path'),
    mongoose        = require('mongoose'),
    favicon         = require('serve-favicon'),
    logger          = require('morgan'),
    bodyParser      = require('body-parser'),
    appConfig       = require("./server/config"),
    router          = require("./server/routes/router"),
    app             = express();

//middlewares
app.use(favicon(path.join(__dirname, "public/favicon.ico")));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({type: 'application/json'}));
app.use(logger('dev'));
app.use('/', router);

//middlewares: error handling
app.use(function(req, res, next){
    res.status(404);
    console.log('Not found URL: %s',req.url);
    res.send({ error: 'Not found' });
    return;
});
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    console.log('Internal error(%d): %s',res.statusCode,err.message);
    res.send({ error: err.message });
    return;
});


// connect to db
mongoose.connect(appConfig.database)
mongoose.connection.on('error', function(err) {
   console.log('Error: Could not connect to MongoDB');
});
mongoose.connection.once('open', function() {
  console.log('Connection to MongoDB is started');
});

// start server
app.listen(appConfig.port, function(){
    console.log('Express server listening on port 1337');
});