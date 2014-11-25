'use strict';

var $ = require('jquery');
var utils = require('./utils');
var hardCodedTwitterUserForTestingLocally = 'johnmayer';

var drawConfig = {
  radius: 335,
  centerX: 250,
  centerY: 325
};

function renderCharCountChart(ctx, dataObj) {
  var numPoints = Object.keys(dataObj).length,
    angleIncrement = (360 / numPoints),
    rad = Math.PI / 180;

  var i = 0,
    mult = utils.getDistMult(dataObj, drawConfig.radius * 0.5),
    minOffset = 45;

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#EC0972';
  ctx.beginPath();

  for (var key in dataObj) {
    var amount = dataObj[key],
      angleStep = (angleIncrement * i - 90),
      x = ((mult * amount + minOffset) * Math.cos(angleStep * rad)),
      y = ((mult * amount + minOffset) * Math.sin(angleStep * rad));

    ctx.moveTo(drawConfig.centerX, drawConfig.centerY);
    ctx.lineTo(drawConfig.centerX + x, drawConfig.centerY + y);

    i++;
  }
  ctx.stroke();

  // Fill center
  ctx.fillStyle = 'rgba(39, 54, 63, 1)';
  ctx.moveTo(drawConfig.centerX, drawConfig.centerY);
  ctx.arc(drawConfig.centerX, drawConfig.centerY, 40, 0, 2 * Math.PI);
  ctx.fill();

  i = 0;
  ctx.font = '6pt HelveticaNeue-Light';
  ctx.fillStyle = '#76787A';
  ctx.strokeStyle = '#76787A';
  ctx.textAlign = 'center';
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (var i = 0; i < numPoints; i++) {
    var circRadius = 222,
      angleStep = (angleIncrement * i - 90),
      xx = drawConfig.centerX + circRadius * Math.cos(angleStep * rad),
      yy = drawConfig.centerY + circRadius * Math.sin(angleStep * rad),
      xxx = drawConfig.centerX + (circRadius + 10) * Math.cos(angleStep * rad),
      yyy = drawConfig.centerY + (circRadius + 10) * Math.sin(angleStep * rad),
      textX = drawConfig.centerX + (circRadius + 20) * Math.cos(angleStep * rad),
      textY = drawConfig.centerY + 3 + (circRadius + 20) * Math.sin(angleStep * rad);

    ctx.moveTo(xx, yy);
    ctx.lineTo(xxx, yyy);

    if (i % 10 == 9) {
      ctx.fillText(i +1, textX, textY);
    }
  }

  ctx.stroke();

  console.log('Rendering to ', ctx, numPoints);
}

/**
 * Parse logic for building out data sets
 * @param  {Array} data set of incoming tweet objecs from server
 */
function parseData(data) {

  var allTweetChars = [],
    timeOfDay = {},
    charCount = {},
    mostUsedChar = {};

  $.each(data.tweets, function(i, tweet) {
    var tweetText = tweet.text,
      tweetHour = utils.getHours(tweet.created_at),
      totalChars = utils.getCharCount(tweetText);

    // For time of day
    if (timeOfDay[tweetHour] === undefined) {
      timeOfDay[tweetHour] = 0;
    } else {
      timeOfDay[tweetHour] ++;
    }

    // For character counts
    if (charCount[totalChars] === undefined) {
      charCount[totalChars] = 1;
    } else {
      charCount[totalChars] ++;
    }

    allTweetChars.push(tweetText);
  });

  var allTweetCharStr = allTweetChars.join('').replace(/\s+/g, '').toLowerCase(),
    decoded = $('<div/>').html(allTweetCharStr).text(),
    allChars = decoded.split('');

  $.each(allChars, function(indx, character) {
    if (mostUsedChar[character] === undefined) {
      mostUsedChar[character] = 1;
    } else {
      mostUsedChar[character] ++;
    }
  });

  // Normalize time of day
  for (var i = 1; i <= 24; i++) {
    if (!timeOfDay[i]) {
      timeOfDay[i] = 0;
    }
  }

  // Normalize character counts
  for (var j = 1; j <= Object.keys(charCount).length; j++) {
    if (!charCount[j]) {
      charCount[j] = 0;
    }
  }
  // Get rid of anything over 140 chars
  for (var key in charCount) {
    if (parseInt(key) > 140) {
      delete charCount[key];
    }
  }

  // Get rid of crap characters
  for (var key in mostUsedChar) {
    try {
      if (encodeURI(key).length > 1) {
        delete mostUsedChar[key];
      }
    } catch (err) {
      delete mostUsedChar[key];
    }
  }

  // Filltext user name
  var ctx = document.getElementById('time-of-day').getContext('2d');
  ctx.font = '14pt HelveticaNeue-Light';
  ctx.fillStyle = '#76787A';
  ctx.textAlign = 'left';
  ctx.fillText('@' + hardCodedTwitterUserForTestingLocally, 15, 30);

  // Render time of day chart to the timeof day canvas element
  renderCharCountChart(ctx, charCount);

  // Done parsing
  console.log('Time of day:', timeOfDay, 'Character Count:', charCount, 'Most Used Character:', mostUsedChar);

}

function init() {
  var promise = $.getJSON('http://localhost:5000/api/timeline?screen_name=' + hardCodedTwitterUserForTestingLocally);
  promise.then(function(data) {
    parseData(data);
  });
}

$(init);
