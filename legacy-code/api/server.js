// Modules for webserver and livereload
var express = require('express'),
  refresh = require('gulp-livereload'),
  livereload = require('connect-livereload'),
  livereloadport = 35729,
  serverport = 5000;

// Include the Twitter module
var Twitter = require('../api/Twitter');

var twitterConfig = {
  "consumerKey": "W8Ag86YUwL7VqqugyEX7ggTrI",
  "consumerSecret": "y0oQWZAoSbczpES5dyQjs26CdehmIGFlJZ0FL09AYrwUbbvm4M",
  "accessToken": "19319034-2tLwzEC0ayVI6S2xgrX6jiqerkrLPBc8N5xmzKLUp",
  "accessTokenSecret": "wXCZMD6xyjmVa72xHOyWV0h0BUxUc1xenAtCd5r0Dbmcy"
};

// Set up an express server (not starting it yet)
var server = express();

// Add live reload
server.use(livereload({
  port: livereloadport
}));

server.get('/api/timeline', function(req, res, next) {

  if (req.query.screen_name && req.query.screen_name.length) {
    console.log('Twitter User @:', req.query.screen_name);
    var twt = new Twitter.Twitter(twitterConfig);
    twt.getUserTimeline({
      screen_name: req.query.screen_name,
      count: 200 //TODO: Paginate these results to get all 3200
    }, function(err) {
      res.json({
        error: 'user not found'
      });
    }, function(data) {
      res.json({
        tweets: JSON.parse(data)
      });
    });
  }

});

// Use our 'dist' folder as rootfolder
server.use(express.static('dist'));
// Because I like HTML5 pushstate .. this redirects everything back to our index.html
server.all('/*', function(req, res) {
  res.sendFile('index.html', {
    root: 'dist'
  });
});

server.listen(3000, function() {
  console.log('Listening on port', process.env.PORT || 3000);
});

module.exports = {
  server: server,
  refresh: refresh,
  livereloadport: livereloadport,
  serverport: serverport
};

