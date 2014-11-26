'use strict';

require('../js/vendor/dat.gui.min.js');

var $ = require('jquery'),
  utils = require('./utils'),
  hardCodedTwitterUserForTestingLocally = 'tylermadison',
  locStr = window.location.href.toString(),
  user = locStr.substr(locStr.indexOf('@') + 1);

if (user.length) {
  hardCodedTwitterUserForTestingLocally = user;
}
console.log(user);

var drawConfig = {
  radius: 335,
  centerX: 250,
  centerY: 325
};

// When data parses store in hash
var models = {};

var DatGUIConfig = function() {
  this.showMerged = false;
}

var Point = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

function setupGUI() {
  var config = new DatGUIConfig(),
    datGUI = new dat.GUI();
  (datGUI.add(config, 'showMerged')).onChange(function(newVal) {
    renderCharCountChart(document.getElementById('charater-counts').getContext('2d'), models.charCount, !newVal);
    renderTimeOfDayChart(document.getElementById('time-of-day').getContext('2d'), models.timeOfDay, !newVal);
    renderMostUsedCharacterChart(document.getElementById('most-used').getContext('2d'), models.mostUsedChar, !newVal);

    $('#charater-counts, #time-of-day, #most-used, #most-used-markers').toggleClass('merged')

    if (newVal === true) {
      var ctx = document.getElementById('most-used').getContext('2d');
      ctx.font = '14pt HelveticaNeue-Light';
      ctx.fillStyle = '#76787A';
      ctx.textAlign = 'left';
      ctx.fillText('@' + hardCodedTwitterUserForTestingLocally, 15, 30);
      ctx.font = '9pt HelveticaNeue-Light';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('Layering of all three - looks pretty cool, just sayin.', 250, 630);
    }

  });
}

function renderCharCountChart(ctx, dataObj, renderOutlines) {
  var numPoints = Object.keys(dataObj).length,
    angleIncrement = (360 / numPoints),
    rad = Math.PI / 180;

  var i = 0,
    mult = utils.getDistMult(dataObj, drawConfig.radius * 0.5),
    minOffset = 45;

  ctx.clearRect(0, 0, 500, 650);

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#EC0972';
  ctx.beginPath();

  for (var key in dataObj) {
    var amount = dataObj[key],
      angleStep = (angleIncrement * i - 88),
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
  ctx.font = '8pt HelveticaNeue-Light';
  ctx.fillStyle = '#76787A';
  ctx.strokeStyle = '#76787A';
  ctx.textAlign = 'center';
  ctx.lineWidth = 1;

  // Draw tick marks around circumference
  //
  if (renderOutlines) {
    for (var i = 0; i < numPoints; i++) {
      ctx.beginPath();
      var circRadius = 222,
        angleStep = (angleIncrement * i - 88),
        xx = drawConfig.centerX + circRadius * Math.cos(angleStep * rad),
        yy = drawConfig.centerY + circRadius * Math.sin(angleStep * rad),
        xxx = drawConfig.centerX + (circRadius + 10) * Math.cos(angleStep * rad),
        yyy = drawConfig.centerY + (circRadius + 10) * Math.sin(angleStep * rad),
        textX = drawConfig.centerX + (circRadius + 20) * Math.cos(angleStep * rad),
        textY = drawConfig.centerY + 3 + (circRadius + 20) * Math.sin(angleStep * rad);
      // Place times ever 10th character
      if (i % 10 == 9) {
        ctx.fillText(i + 1, textX, textY);
        ctx.strokeStyle = '#ffffff';
      } else {
        ctx.strokeStyle = '#76787A';
      }

      ctx.moveTo(xx, yy);
      ctx.lineTo(xxx, yyy);
      ctx.stroke();
    }

    ctx.font = '9pt HelveticaNeue-Light';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Graph A: character count within a tweet', 250, 630);

    // Filltext user name
    var ctx = document.getElementById('charater-counts').getContext('2d');
    ctx.font = '14pt HelveticaNeue-Light';
    ctx.fillStyle = '#76787A';
    ctx.textAlign = 'left';
    ctx.fillText('@' + hardCodedTwitterUserForTestingLocally, 15, 30);
  }

}

function renderTimeOfDayChart(ctx, dataObj, renderOutlines) {
  var numPoints = Object.keys(dataObj).length,
    angleIncrement = (360 / numPoints),
    rad = Math.PI / 180;

  var markers = [];

  var i = 0,
    startX = -1,
    startY = -1,
    lastX = -1,
    lastY = -1,
    mult = utils.getDistMult(dataObj, drawConfig.radius - 225),
    minOffset = 45; // Inner circle

  // console.log('Using Multiplyer :: ', mult);

  ctx.clearRect(0, 0, 500, 650);

  ctx.beginPath();

  //console.log('Rendering time of day: ', dataObj);

  var highestVal = -1,
    highestPoint = null;

  for (var key in dataObj) {
    var amount = dataObj[key],
      angleStep = (angleIncrement * i - 90),
      currX = ((mult * amount + minOffset) * Math.cos(angleStep * rad)),
      currY = ((mult * amount + minOffset) * Math.sin(angleStep * rad));

    //console.log(key, '==>', amount);

    if (startX === -1 && startY === -1) {
      startX = drawConfig.centerX + currX;
      startY = drawConfig.centerY + currY;
    }

    // Next point to draw to
    var nextX = ((mult * amount + minOffset) * Math.cos(angleStep * rad)),
      nextY = ((mult * amount + minOffset) * Math.sin(angleStep * rad));

    if (i === numPoints) {
      ctx.lineTo(startX, startY); // Gets back to home to fill
    } else {
      if (i === 0) {

        lastX = drawConfig.centerX + nextX;
        lastY = drawConfig.centerY + nextY;

        ctx.moveTo(drawConfig.centerX + currX, drawConfig.centerY + currY);
        ctx.lineTo(lastX, lastY);

        // push new point to mark
        markers.push(new Point(drawConfig.centerX + currX, drawConfig.centerY + currY));

      } else {
        lastX = drawConfig.centerX + nextX;
        lastY = drawConfig.centerY + nextY;

        ctx.lineTo(lastX, lastY);

        // push new point to mark
        markers.push(new Point(lastX, lastY));

      }

    }

    if (amount > highestVal) {
      highestVal = amount;
      highestPoint = new Point(drawConfig.centerX + currX, drawConfig.centerY + currY);
    }

    i++;
  }

  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 173, 239, 0.5)';
  ctx.fill();

  // Fill center
  /*  ctx.beginPath();
    ctx.fillStyle = 'rgba(39, 54, 63, 1)';
    ctx.moveTo(drawConfig.centerX, drawConfig.centerY);
    ctx.arc(drawConfig.centerX, drawConfig.centerY, 40, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();*/

  // Draw tick marks around circumference
  if (renderOutlines) {
    for (var i = 0; i < numPoints; i++) {
      ctx.beginPath();
      var circRadius = 180,
        angleStep = (angleIncrement * i - 75),
        xx = drawConfig.centerX + circRadius * Math.cos(angleStep * rad),
        yy = drawConfig.centerY + circRadius * Math.sin(angleStep * rad),
        xxx = drawConfig.centerX + (circRadius + 10) * Math.cos(angleStep * rad),
        yyy = drawConfig.centerY + (circRadius + 10) * Math.sin(angleStep * rad),
        textX = drawConfig.centerX + (circRadius - 12) * Math.cos(angleStep * rad),
        textY = drawConfig.centerY + 3 + (circRadius - 12) * Math.sin(angleStep * rad);
      // Place times ever 10th character
      if (i % 6 == 5) {
        ctx.font = '8pt HelveticaNeue-Light';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#76787A';
        ctx.fillText(i + 1, textX, textY);
        ctx.strokeStyle = '#ffffff';
      } else {
        ctx.strokeStyle = '#76787A';
      }

      ctx.moveTo(xx, yy);
      ctx.lineTo(xxx, yyy);
      ctx.stroke();
    }
    ctx.font = '9pt HelveticaNeue-Light';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Graph B: time of day', 250, 630);

    ctx.font = '14pt HelveticaNeue-Light';
    ctx.fillStyle = '#76787A';
    ctx.textAlign = 'left';
    ctx.fillText('@' + hardCodedTwitterUserForTestingLocally, 15, 30);
  }

  drawTrianlgeMarker(highestPoint, ctx);
  //console.log('highestVal:', highestVal, highestPoint);

}

function renderMostUsedCharacterChart(ctx, dataObj, renderOutlines) {
  var chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '!', '?', '/', '#', '$', '%', '&', '*', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '@', '.', ',', ':', '"'];

  var numPoints = chars.length,
    angleIncrement = (360 / numPoints),
    rad = Math.PI / 180;

  var markers = models.mostUsedMarkers = [];

  var i = 0,
    startX = -1,
    startY = -1,
    lastX = -1,
    lastY = -1,
    mult = utils.getDistMult(dataObj, drawConfig.radius * 0.5),
    minOffset = 45; // Inner circle

  ctx.clearRect(0, 0, 500, 650);

  ctx.beginPath();

  for (var i = 0; i < chars.length; i++) {

    var amount = dataObj[chars[i]] || 0,
      angleStep = (angleIncrement * i - 90),
      currX = ((mult * amount + minOffset) * Math.cos(angleStep * rad)),
      currY = ((mult * amount + minOffset) * Math.sin(angleStep * rad));

    //console.log('plotting: ', chars[i], dataObj[chars[i]] || 0);

    if (startX === -1 && startY === -1) {
      startX = drawConfig.centerX + currX;
      startY = drawConfig.centerY + currY;
    }

    // Next point to draw to
    var nextX = ((mult * amount + minOffset) * Math.cos(angleStep * rad)),
      nextY = ((mult * amount + minOffset) * Math.sin(angleStep * rad));

    if (i === numPoints) {
      ctx.lineTo(startX, startY); // Gets back to home to fill
    } else {
      if (i === 0) {
        lastX = drawConfig.centerX + nextX;
        lastY = drawConfig.centerY + nextY;
        ctx.moveTo(drawConfig.centerX + currX, drawConfig.centerY + currY);
        ctx.lineTo(lastX, lastY);
        markers.push(new Point(lastX, lastY));
      } else {
        lastX = drawConfig.centerX + nextX;
        lastY = drawConfig.centerY + nextY;
        ctx.lineTo(lastX, lastY);
        markers.push(new Point(lastX, lastY));
      }
    }
  }

  ctx.closePath();

  ctx.fillStyle = 'rgba(0, 173, 239, 0.2)';
  ctx.fill();

  ctx.fillStyle = '#76787A';
  ctx.beginPath();

  if (renderOutlines) {
    for (var i = 0; i < chars.length; i++) {
      var circRadius = 222,
        angleStep = (angleIncrement * i - 90),
        xx = drawConfig.centerX + circRadius * Math.cos(angleStep * rad),
        yy = drawConfig.centerY + circRadius * Math.sin(angleStep * rad),
        xxx = drawConfig.centerX + (circRadius + 10) * Math.cos(angleStep * rad),
        yyy = drawConfig.centerY + (circRadius + 10) * Math.sin(angleStep * rad),
        textX = drawConfig.centerX + (circRadius + 20) * Math.cos(angleStep * rad),
        textY = drawConfig.centerY + 3 + (circRadius + 20) * Math.sin(angleStep * rad);
      // Place times ever 10th character

      ctx.textAlign = 'center';

      if (i < 26 || i > 33 && i < 44) {
        ctx.fillStyle = '#ffffff';
      } else {
        ctx.fillStyle = '#76787A';
      }
      ctx.font = '8pt HelveticaNeue-Light';
      ctx.fillText(chars[i].toUpperCase(), textX, textY);
      ctx.strokeStyle = '#76787A';

      ctx.moveTo(xx, yy);
      ctx.lineTo(xxx, yyy);

    }
    ctx.font = '9pt HelveticaNeue-Light';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Graph C: most used character', 250, 630);

    ctx.font = '14pt HelveticaNeue-Light';
    ctx.fillStyle = '#76787A';
    ctx.textAlign = 'left';
    ctx.fillText('@' + hardCodedTwitterUserForTestingLocally, 15, 30);

    // Draw the markers
    drawMarkers(models.mostUsedMarkers, ctx);

    var mostUsedCtx = document.getElementById('most-used-markers').getContext('2d');
    mostUsedCtx.clearRect(0, 0, 500, 650);
    drawMarkers(models.mostUsedMarkers, mostUsedCtx);
  }

  ctx.stroke();

}

function drawMarkers(points, ctx) {

  for (var i = 0; i < points.length; i++) {
    var point = points[i];
    //console.log('drawing point', point.x, point.y);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(3, 161, 220, 1)';
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
  }
}

function drawTrianlgeMarker(point, ctx) {
  var tW = 6,
    tH = 6;

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(3, 161, 220, 1)';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.moveTo(point.x - tW, point.y + 3);
  ctx.lineTo(point.x + 0, point.y - tH);
  ctx.lineTo(point.x + tW, point.y + 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
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

  models['charCount'] = charCount;
  models['timeOfDay'] = timeOfDay
  models['mostUsedChar'] = mostUsedChar;

  // Render time of day chart to the timeof day canvas element
  renderCharCountChart(document.getElementById('charater-counts').getContext('2d'), models.charCount, true);
  renderTimeOfDayChart(document.getElementById('time-of-day').getContext('2d'), models.timeOfDay, true);
  renderMostUsedCharacterChart(document.getElementById('most-used').getContext('2d'), models.mostUsedChar, true);

}

function init() {
  var promise = $.getJSON('http://localhost:5000/api/timeline?screen_name=' + hardCodedTwitterUserForTestingLocally);
  promise.then(function(data) {
    parseData(data);
  });

  setupGUI();
}

$(init);
