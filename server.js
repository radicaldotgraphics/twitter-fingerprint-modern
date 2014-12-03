var Twitter = require('./api/Twitter');

var twitterConfig = {
  "consumerKey": "W8Ag86YUwL7VqqugyEX7ggTrI",
  "consumerSecret": "y0oQWZAoSbczpES5dyQjs26CdehmIGFlJZ0FL09AYrwUbbvm4M",
  "accessToken": "19319034-2tLwzEC0ayVI6S2xgrX6jiqerkrLPBc8N5xmzKLUp",
  "accessTokenSecret": "wXCZMD6xyjmVa72xHOyWV0h0BUxUc1xenAtCd5r0Dbmcy"
};

var express = require('express');

var http = require('http');
var path = require('path');
//var io = require('socket.io').listen(server);

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
/*app.set('views', path.join(__dirname, 'views'));
 */
/*app.use(express.json());*/
//pp.use(express.urlencoded());
//app.use(express.methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'dist')));

/*app.get('/', routes.index);
app.get('/connect', connect.connect);
app.get('/users', user.list);*/

app.get('/api/timeline', function(req, res, next) {

  if (req.query.screen_name && req.query.screen_name.length) {
    console.log('Twitter User @:', req.query.screen_name);
    var twt = new Twitter.Twitter(twitterConfig);
    twt.getUserTimeline({
      screen_name: req.query.screen_name,
      count: 200 //TODO: Paginate these results to get all 3200
    }, function() {}, function(data) {
      res.json({
        tweets: JSON.parse(data)
      });

    });
  }

});

app.all('/*', function(req, res) {
  res.sendFile('index.html', {
    root: 'dist'
  });
});

var server = http.createServer(app);

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'), __dirname);
});

// Modules for webserver and livereload
/*var express = require('express'),
  refresh = require('gulp-livereload'),
  livereload = require('connect-livereload'),
  livereloadport = 35729,
  serverport = 5000;*/

//var path = require('path');

// Include the Twitter module
/*var Twitter = require('./api/Twitter');

var twitterConfig = {
  "consumerKey": "W8Ag86YUwL7VqqugyEX7ggTrI",
  "consumerSecret": "y0oQWZAoSbczpES5dyQjs26CdehmIGFlJZ0FL09AYrwUbbvm4M",
  "accessToken": "19319034-2tLwzEC0ayVI6S2xgrX6jiqerkrLPBc8N5xmzKLUp",
  "accessTokenSecret": "wXCZMD6xyjmVa72xHOyWV0h0BUxUc1xenAtCd5r0Dbmcy"
};*/

// Set up an express server (not starting it yet)
/*var server = express();
server.set('port', process.env.PORT || 3000);

var http = require('http');*/

// Add live reload
/*server.use(livereload({
  port: livereloadport
}));*/

/*server.get('/api/timeline', function(req, res, next) {

  if (req.query.screen_name && req.query.screen_name.length) {
    console.log('Twitter User @:', req.query.screen_name);
    var twt = new Twitter.Twitter(twitterConfig);
    twt.getUserTimeline({
      screen_name: req.query.screen_name,
      count: 200 //TODO: Paginate these results to get all 3200
    }, function() {}, function(data) {
      res.json({
        tweets: JSON.parse(data)
      });

    });
  }

});
*/
//var appServer = http.createServer(server);

// Use our 'dist' folder as rootfolder
//server.use(express.static('dist'));
//server.use(express.static(path.join(__dirname, 'dist')));

// Because I like HTML5 pushstate .. this redirects everything back to our index.html
/*server.all('/*', function(req, res) {
  res.sendFile('index.html', {
    root: 'dist'
  });
});*/

/*appServer.listen(server.get('port'), function() {
  console.log('Express server listening on port ' + server.get('port'), __dirname);
});*/

/*module.exports = {
  server: server,
  refresh: refresh,
  livereloadport: livereloadport,
  serverport: serverport
};
*/

