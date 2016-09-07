
var express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
  mongoskin = require('mongoskin'),
  dbUrl = process.env.MONGOHQ_URL || 'mongodb://@localhost:27017/mysensors',
  db = mongoskin.db(dbUrl, {safe: true}),
  collections = {
    adminDb: db.collection('adminDb'),
    users: db.collection('users')
  }


var app = express();
app.locals.appTitle = "Admin Panel | SENZ Switch";

app.use(function(req, res, next) {
  if (!collections.adminDb || ! collections.users)
    return next(new Error("Problem with the database"))
  req.collections = collections;
  return next();
});



// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon("public/images/logo.png"));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.cookieParser('3CCC4ACD-6ED1-4844-9217-82131BDCB239'));
app.use(express.session({secret: '2C44774A-D649-4D44-9535-46E296EF984F'}))
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  if (req.session && req.session.admin)
    res.locals.admin = true;
  next();
});

//authorization
var authorize = function(req, res, next) {
  if (req.session && req.session.admin)
    return next();
  else
    return res.send(401);
};

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.use(app.router);
//PAGES&ROUTES
app.get('/', routes.index);
app.get('/login', routes.user.login);
app.post('/login', routes.user.authenticate); //if you use everyauth, this /logout route is overwriting by everyauth automatically, therefore we use custom/additional handleLogout
app.get('/logout', routes.user.logout);
app.get('/admin', authorize, routes.user.getusers); // get the user listing with the configs for the admin page after the login
app.get('/edituser', authorize, routes.user.edituser);   //load the edit user page
app.post('/edit', authorize, routes.user.edit);
app.get('/getusers', authorize, routes.user.getusers);
app.get('/deluser/id/:_id/name/:name', authorize, routes.user.deluser);  // Delete senz clients users from the mongo database includes confirmations
app.get('/delattr/name/:name/attr/:val', authorize, routes.user.delattr);  // revoke attributes shared to users



app.all('*', function(req, res) {
  res.send(404);
})


var server = http.createServer(app);
var boot = function () {
  server.listen(app.get('port'), function(){
    console.info('Express server listening on port ' + app.get('port'));
  });
}
var shutdown = function() {
  server.close();
}
if (require.main === module) {
  boot();
}
else {
  console.info('Running app as a module')
  exports.boot = boot;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}
