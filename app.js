// Modules for webserver and livereload
var express = require('express'),
  path = require('path'),
  livereloadport = 35729,
  serverport = 5000;

// Include the Twitter module
var Twitter = require('./api/Twitter');

var twitterConfig = {
  "consumerKey": "W8Ag86YUwL7VqqugyEX7ggTrI",
  "consumerSecret": "y0oQWZAoSbczpES5dyQjs26CdehmIGFlJZ0FL09AYrwUbbvm4M",
  "accessToken": "19319034-2tLwzEC0ayVI6S2xgrX6jiqerkrLPBc8N5xmzKLUp",
  "accessTokenSecret": "wXCZMD6xyjmVa72xHOyWV0h0BUxUc1xenAtCd5r0Dbmcy"
};

// Set up an express server (not starting it yet)
var server = express();
server.set('port', process.env.PORT || 3000);

var router = express.Router();

server.get('/api/timeline', function(req, res, next) {

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

server.use(express.static(path.join(__dirname, 'dist')));
router.use(function(req, res, next) {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

server.get('/*', router);
server.get('/:username', router);

server.listen(server.get('port'), function() {
  console.log('Express server listening on port ' + server.get('port'), __dirname);
});

