'use strict';

var Handlebars = require('../js/vendor/handlebars-v2.0.0.js');

var $ = require('jquery'),
  utils = require('./utils'),
  ChartOption = require('./chart-option'),
  userName = 'tylermadison',
  locStr = window.location.href.toString(),
  user = locStr.substr(locStr.indexOf('@') + 1);

//////////////////////////////////////////////////////////
// CONSTANTS

// Common draw variables
var DrawConfig = {
  CANVAS_WIDTH: 600,
  CANVAS_HEIGHT: 600,
  RADIUS: 360,
  CENTER_X: 300,
  CENTER_Y: 275
};

// Common colors store
var Colors = {
  GRAY: '#76787A',
  PINK: '#EC0972',
  WHITE: '#FFFFFF',
  BRIGHT_BLUE: '#0696CB',
  TIME_OF_DAY_FILL: '#195872',
  MOST_USED_FILL: '#1D3C46',
  GREEN: '#00FF00'
}

// Text alignments
var TextAlign = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right'
}

var activeChartIndx = 1;
var stats = {};
var canvasIds = ['#time-of-day', '#character-counts', '#most-used, #most-used-markers'];

// TODO: add canvas element names as constants
// var CanvasClassIds = {}

// END CONSTANTS
///////////////////////////////////////////////////////////

// When data parses store in hash
var models = {};

var renderedIndividually = false;

// Convenience cartesian point object
var Point = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

function drawHighPointRect(point, ctx) {
  var rW = 3.5,
    rH = 3.5;

  ctx.beginPath();
  ctx.strokeStyle = Colors.PINK;
  ctx.fillStyle = Colors.WHITE;
  ctx.lineWidth = 1;
  ctx.moveTo(point.x - rW, point.y - rH);
  ctx.lineTo(point.x + rW, point.y - rH);
  ctx.lineTo(point.x + rW, point.y + rH);
  ctx.lineTo(point.x - rW, point.y + rH);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawHighPointCirc(point, ctx) {
  var radius = 4;

  ctx.beginPath();
  ctx.strokeStyle = Colors.BRIGHT_BLUE;
  ctx.fillStyle = Colors.WHITE;
  ctx.lineWidth = 0.25;
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/**
 * Renders the char count per tweet chart
 * @param  {Object} ctx canvas 2d context object
 * @param  {Object} dataObj data hash of values to plot against
 * @param  {Boolean} renderOutlineMarkers should we draw the map with the outline indicators
 */
function renderCharCountChart(ctx, dataObj, renderOutlineMarkers) {
  var numPoints = Object.keys(dataObj).length,
    angleIncrement = (360 / numPoints),
    rad = Math.PI / 180,
    i = 0,
    mult = utils.getDistMult(dataObj, DrawConfig.RADIUS * 0.5),
    minOffset = 40,
    charCountLines = [];

  var highestVal = -1,
    highestPoint = null;

  var totalAmount = 0;

  // Clear out canvas
  ctx.clearRect(0, 0, DrawConfig.CANVAS_WIDTH, DrawConfig.CANVAS_HEIGHT);

  // Gather points per line
  for (var key in dataObj) {
    var amount = dataObj[key],
      angleStep = (angleIncrement * i - 90),
      angleXRad = Math.cos(angleStep * rad),
      angleYRad = Math.sin(angleStep * rad),
      dist = mult * amount + minOffset,
      startPoint = new Point(DrawConfig.CENTER_X + minOffset * angleXRad, DrawConfig.CENTER_Y + minOffset * angleYRad),
      endPoint = new Point(DrawConfig.CENTER_X + dist * angleXRad, DrawConfig.CENTER_Y + dist * angleYRad);

    totalAmount += (amount * parseInt(key, 10));

    charCountLines.push({
      start: startPoint,
      end: endPoint
    });

    if (amount > highestVal) {
      highestVal = amount;
      highestPoint = endPoint;
    }

    i++;
  }

  // Draw lines extruding from center
  drawLines(charCountLines, 1, Colors.PINK, ctx);

  setTimeout(function() {
    drawHighPointRect(highestPoint, ctx);
  }, 1250);

  //$('#character-counts').addClass('trigger');

  ctx.font = '8pt HelveticaNeue-Light';
  ctx.fillStyle = Colors.GRAY;
  ctx.strokeStyle = Colors.GRAY;
  ctx.textAlign = TextAlign.CENTER;

  // Draw tick marks around circumference
  //
  if (renderOutlineMarkers) {
    for (var i = 0; i < numPoints; i++) {
      ctx.beginPath();
      var circRadius = 235,
        angleStep = (angleIncrement * i - 90),
        angleXRad = Math.cos(angleStep * rad),
        angleYRad = Math.sin(angleStep * rad),
        startPoint = new Point(DrawConfig.CENTER_X + circRadius * angleXRad, DrawConfig.CENTER_Y + circRadius * angleYRad),
        endPoint = new Point(DrawConfig.CENTER_X + (circRadius + 10) * angleXRad, DrawConfig.CENTER_Y + (circRadius + 10) * angleYRad),
        textX = DrawConfig.CENTER_X + (circRadius + 20) * Math.cos(angleStep * rad),
        textY = DrawConfig.CENTER_Y + 3 + (circRadius + 20) * Math.sin(angleStep * rad);

      // Place times ever 10th character
      if (i % 10 == 9) {
        if (i === 139) {
          ctx.fillStyle = Colors.WHITE;
        } else {
          ctx.fillStyle = Colors.GRAY;
        }
        ctx.fillText(i + 1, textX, textY);
        ctx.strokeStyle = Colors.WHITE;
      } else {
        ctx.strokeStyle = Colors.GRAY;
      }

      drawTickIndicator({
        start: startPoint,
        end: endPoint
      }, 1, ctx);
    }
  }

  // Add average tweet length to stats object for templating
  stats.averageTweetLength = Math.ceil(totalAmount / numPoints);

}

function renderTimeOfDayChart(ctx, dataObj, renderOutlines) {
  var numPoints = Object.keys(dataObj).length,
    angleIncrement = (360 / numPoints),
    rad = Math.PI / 180,
    angleOffset = 90 - (360 / numPoints);

  var i = 0,
    startX = -1,
    startY = -1,
    lastX = -1,
    lastY = -1,
    mult = utils.getDistMult(dataObj, DrawConfig.RADIUS - 225),
    minOffset = 41; // Inner circle

  var points = [];

  ctx.clearRect(0, 0, DrawConfig.CANVAS_WIDTH, DrawConfig.CANVAS_HEIGHT);
  //ctx.beginPath();

  var highestVal = -1,
    highestPoint = null;

  var peakTime = -1,
    lowTime = -1,
    lowestAmount = Infinity;

  for (var key in dataObj) {
    var amount = dataObj[key],
      angleStep = (angleIncrement * i - angleOffset),
      currX = ((mult * amount + minOffset) * Math.cos(angleStep * rad)),
      currY = ((mult * amount + minOffset) * Math.sin(angleStep * rad));

    if (amount < lowestAmount) {
      lowTime = key;
      lowestAmount = amount;
    }

    if (amount > highestVal) {
      peakTime = key;
      highestVal = amount;
      highestPoint = new Point(DrawConfig.CENTER_X + currX, DrawConfig.CENTER_Y + currY);
    }
    i++;
  }
  var scale = 0.001;

  function animate() {
    var i = 0;
    var points = [];
    for (var key in dataObj) {
      var amount = dataObj[key],
        angleStep = (angleIncrement * i - angleOffset),
        currX = (((mult * scale) * amount + minOffset) * Math.cos(angleStep * rad)),
        currY = (((mult * scale) * amount + minOffset) * Math.sin(angleStep * rad));

      if (startX === -1 && startY === -1) {
        startX = DrawConfig.CENTER_X + currX;
        startY = DrawConfig.CENTER_Y + currY;
      }

      // Next point to draw to
      var nextX = (((mult * scale) * amount + minOffset) * Math.cos(angleStep * rad)),
        nextY = (((mult * scale) * amount + minOffset) * Math.sin(angleStep * rad));

      if (i === 0) {
        // Push start end to new point obect
        points.push(new Point(currX, currY));
      } else {
        // Push start end to new point obect
        points.push(new Point(nextX, nextY));
      }

      i++;
    }

    drawPoly(points, ctx, Colors.TIME_OF_DAY_FILL);

    if (scale < 1) {
      scale *= 1.1;
      if (scale > 1) {
        scale = 1;
      }
      requestAnimationFrame(animate);
    } else {
      drawTrianlgeMarker(highestPoint, ctx);
    }

  }

  // Draw tick marks around circumference
  if (renderOutlines) {
    for (var i = 0; i < numPoints; i++) {
      ctx.beginPath();
      var circRadius = 200,
        angleStep = (angleIncrement * i - 75),
        xx = DrawConfig.CENTER_X + circRadius * Math.cos(angleStep * rad),
        yy = DrawConfig.CENTER_Y + circRadius * Math.sin(angleStep * rad),
        xxx = DrawConfig.CENTER_X + (circRadius + 10) * Math.cos(angleStep * rad),
        yyy = DrawConfig.CENTER_Y + (circRadius + 10) * Math.sin(angleStep * rad),
        textX = DrawConfig.CENTER_X + (circRadius - 12) * Math.cos(angleStep * rad),
        textY = DrawConfig.CENTER_Y + 3 + (circRadius - 12) * Math.sin(angleStep * rad);
      // Place times ever 10th character
      if (i % 6 == 5) {
        ctx.font = '8pt HelveticaNeue-Light';
        ctx.textAlign = TextAlign.CENTER;
        ctx.fillStyle = Colors.GRAY;
        ctx.fillText(i + 1, textX, textY);
        ctx.strokeStyle = Colors.WHITE;
      } else {
        ctx.strokeStyle = Colors.GRAY;
      }

      ctx.moveTo(xx, yy);
      ctx.lineTo(xxx, yyy);
      ctx.stroke();
    }
  }

  stats.mostActiveTime = peakTime + ':00 ' + (peakTime >= 12 ? 'PM' : 'AM');
  stats.leastActiveTime = lowTime + ':00 ' + (peakTime >= 12 ? 'PM' : 'AM');

  requestAnimationFrame(animate);

}

function animateLine(line, lineWidth, color, ctx) {
  var speed = 0.00012;

  function animate() {
    ctx.strokeStyle = color || Colors.GREEN;
    ctx.lineWidth = lineWidth || 1;
    ctx.beginPath();
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.start.x + speed * (line.end.x - line.start.x), line.start.y + speed * (line.end.y - line.start.y));
    ctx.stroke();
    ctx.closePath();

    if (speed < 1) {
      speed *= 1.2;
      if (speed > 1) {
        speed = 1;
      }
      requestAnimationFrame(animate);
    }

  }

  requestAnimationFrame(animate);
}

function drawPoly(points, ctx, fillColor) {
  ctx.beginPath();
  ctx.moveTo(DrawConfig.CENTER_X + points[0].x, DrawConfig.CENTER_Y + points[0].y);

  for (var i = 1; i < points.length; i++) {
    ctx.lineTo(DrawConfig.CENTER_X + points[i].x, DrawConfig.CENTER_Y + points[i].y);
  }

  ctx.lineTo(DrawConfig.CENTER_X + points[0].x, DrawConfig.CENTER_Y + points[0].y);

  ctx.closePath();
  ctx.fillStyle = fillColor || '#00ff00';
  ctx.fill();
}

function renderMostUsedCharacterChart(ctx, dataObj, renderOutlines) {
  var chars = utils.getCharacters();

  var numPoints = chars.length,
    angleIncrement = (360 / numPoints),
    rad = Math.PI / 180;

  var markers = [];

  var i = 0,
    startX = -1,
    startY = -1,
    lastX = -1,
    lastY = -1,
    mult = utils.getDistMult(dataObj, DrawConfig.RADIUS * 0.5),
    minOffset = 45; // Inner circle

  var highestVal = -1,
    highestPoint = null,
    mostUsedChar = '';

  var mostUsedCtx = document.getElementById('most-used-markers').getContext('2d');
  mostUsedCtx.clearRect(0, 0, DrawConfig.CANVAS_WIDTH, DrawConfig.CANVAS_HEIGHT);

  ctx.clearRect(0, 0, DrawConfig.CANVAS_WIDTH, DrawConfig.CANVAS_HEIGHT);

  //ctx.beginPath();

  for (var i = 0; i < chars.length; i++) {

    var amount = dataObj[chars[i]] || 0,
      angleStep = (angleIncrement * i - 90),
      currX = ((mult * amount + minOffset) * Math.cos(angleStep * rad)),
      currY = ((mult * amount + minOffset) * Math.sin(angleStep * rad));

    //console.log('plotting: ', chars[i], dataObj[chars[i]] || 0);

    // Next point to draw to
    var nextX = ((mult * amount + minOffset) * Math.cos(angleStep * rad)),
      nextY = ((mult * amount + minOffset) * Math.sin(angleStep * rad));

    if (i === 0) {
      lastX = DrawConfig.CENTER_X + nextX;
      lastY = DrawConfig.CENTER_Y + nextY;
      //ctx.moveTo(DrawConfig.CENTER_X + currX, DrawConfig.CENTER_Y + currY);
      //ctx.lineTo(lastX, lastY);
      markers.push(new Point(lastX, lastY));
    } else {
      lastX = DrawConfig.CENTER_X + nextX;
      lastY = DrawConfig.CENTER_Y + nextY;
      //ctx.lineTo(lastX, lastY);
      markers.push(new Point(lastX, lastY));
    }

    if (amount > highestVal) {
      mostUsedChar = chars[i].toUpperCase();
      highestVal = amount;
      highestPoint = new Point(DrawConfig.CENTER_X + currX, DrawConfig.CENTER_Y + currY);
    }
  }

  var scale = 0.001;

  function animate() {
    var i = 0;
    var points = [];
    for (var i = 0; i < chars.length; i++) {
      var amount = dataObj[chars[i]] || 0,
        angleStep = (angleIncrement * i - 90),
        currX = (((mult * scale) * amount + minOffset) * Math.cos(angleStep * rad)),
        currY = (((mult * scale) * amount + minOffset) * Math.sin(angleStep * rad));

      // Next point to draw to
      var nextX = (((mult * scale) * amount + minOffset) * Math.cos(angleStep * rad)),
        nextY = (((mult * scale) * amount + minOffset) * Math.sin(angleStep * rad));

      if (i === 0) {
        // Push start end to new point obect
        points.push(new Point(currX, currY));
      } else {
        // Push start end to new point obect
        points.push(new Point(nextX, nextY));
      }

    }

    drawPoly(points, ctx, Colors.MOST_USED_FILL);

    if (scale < 1) {
      scale *= 1.1;
      if (scale > 1) {
        scale = 1;
      }
      requestAnimationFrame(animate);
    } else {

      drawMarkers(markers, mostUsedCtx);
      drawHighPointCirc(highestPoint, ctx);
    }

  }

  ctx.fillStyle = Colors.GRAY;
  ctx.beginPath();

  if (renderOutlines) {
    for (var i = 0; i < chars.length; i++) {
      var circRadius = 235,
        angleStep = (angleIncrement * i - 90),
        xx = DrawConfig.CENTER_X + circRadius * Math.cos(angleStep * rad),
        yy = DrawConfig.CENTER_Y + circRadius * Math.sin(angleStep * rad),
        xxx = DrawConfig.CENTER_X + (circRadius + 10) * Math.cos(angleStep * rad),
        yyy = DrawConfig.CENTER_Y + (circRadius + 10) * Math.sin(angleStep * rad),
        textX = DrawConfig.CENTER_X + (circRadius + 20) * Math.cos(angleStep * rad),
        textY = DrawConfig.CENTER_Y + 3 + (circRadius + 20) * Math.sin(angleStep * rad);
      // Place times ever 10th character

      ctx.textAlign = TextAlign.CENTER;

      if (i < 26 || i > 33 && i < 44 || i > 28 && i < 30) {
        ctx.fillStyle = Colors.WHITE;
      } else {
        ctx.fillStyle = Colors.GRAY;
      }
      ctx.font = '8pt HelveticaNeue-Light';
      ctx.fillText(chars[i].toUpperCase(), textX, textY);
      ctx.strokeStyle = Colors.GRAY;

      ctx.moveTo(xx, yy);
      ctx.lineTo(xxx, yyy);

    }
  }

  stats.mostUsedCharacter = mostUsedChar + ' (' + highestVal + ' times)';

  requestAnimationFrame(animate);
}

function drawTickIndicator(line, lineWidth, ctx) {

  if (!ctx) {
    throw new Error('Main: drawTickIndicator method: must pass a canvas element context 2d');
  }

  ctx.beginPath();
  ctx.lineWidth = lineWidth || 1;
  ctx.moveTo(line.start.x, line.start.y);
  ctx.lineTo(line.end.x, line.end.y);
  ctx.stroke();
  ctx.closePath();
}

function drawLines(lines, lineWidth, color, ctx) {

  if (!ctx) {
    throw new Error('Main: drawLines method: must pass a canvas element context 2d');
  }

  for (var i = 0; i < lines.length; i++) {
    animateLine(lines[i], lineWidth, color, ctx);
  }

}

function drawMarkers(points, ctx) {

  for (var i = 0; i < points.length; i++) {
    var point = points[i];
    ctx.beginPath();
    ctx.strokeStyle = Colors.BRIGHT_BLUE;
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
  }
}

function drawTrianlgeMarker(point, ctx) {
  var tW = 6,
    tH = 6;

  ctx.beginPath();
  ctx.strokeStyle = Colors.BRIGHT_BLUE;
  ctx.fillStyle = Colors.WHITE;
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
  for (var j = 1; j <= 140; j++) {
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
  renderCharCountChart(document.getElementById('character-counts').getContext('2d'), models.charCount, false);
  renderTimeOfDayChart(document.getElementById('time-of-day').getContext('2d'), models.timeOfDay, false);
  renderMostUsedCharacterChart(document.getElementById('most-used').getContext('2d'), models.mostUsedChar, false);

  setTimeout(function() {
    $(canvasIds[0]).addClass('active');
    $(canvasIds[1]).addClass('active');
    $(canvasIds[2]).addClass('active');
  }, 250);

  drawCenterX();

  stats.tweetCount = data.tweets.length;

  var $tmplEl = $('#stats-tmpl'),
    source = $tmplEl.html(),
    html = Handlebars.compile(source)(stats);

  $('#stats').html(html);

  //console.log(html);

}

function showChart() {

  $('canvas, .stat').removeClass('active');

  $('.intro').hide();

  setTimeout(function() {

    renderedIndividually = true;
    renderCharCountChart(document.getElementById('character-counts').getContext('2d'), models.charCount, true);
    renderTimeOfDayChart(document.getElementById('time-of-day').getContext('2d'), models.timeOfDay, true);
    renderMostUsedCharacterChart(document.getElementById('most-used').getContext('2d'), models.mostUsedChar, true);

    $(canvasIds[activeChartIndx]).addClass('active');
    $(canvasIds[activeChartIndx]).addClass('active');
    $('.btn-toggle').eq(activeChartIndx).addClass('active');
    $('.stat').eq(activeChartIndx).addClass('active');
    $('#top-layer').addClass('active');
  }, 350);

}

function drawCenterX() {
  var ctx = document.getElementById('top-layer').getContext('2d');
  ctx.font = '5pt HelveticaNeue-Light';
  ctx.fillStyle = '#76787A';
  ctx.textAlign = TextAlign.CENTER;
  ctx.fillText('X', DrawConfig.CENTER_X, DrawConfig.CENTER_Y + 2);
}

function getData() {
  reset();

  var promise = $.getJSON('/api/timeline?screen_name=' + userName);
  promise.then(function(data) {
    $('.chart-inner, .info').css('visibility', 'visible');
    parseData(data);
  });
}

function reset() {
  renderedIndividually = false;
  activeChartIndx = -1;
  stats = {};
  $('.btn-toggle').removeClass('active');

  $('.chart-inner, .info').css('visibility', 'hidden');
}

function init() {
  var self = this;

  reset();

  $('canvas').each(function(i, canvasEl) {
    canvasEl.getContext('2d').scale(2, 2);
  });

  var $userInput = $('.user-name');

  if (user.length && locStr.indexOf('@') > 0) {
    userName = user;
    console.log(user);
    $userInput.val(userName);
    getData();
  }

  $('.user-submit').on('click', function() {
    userName = $userInput.val();
    console.log(userName);
    getData();
  });

  // Bind to buttons
  $('.btn-toggle').on('click', function() {
    $('.btn-toggle').removeClass('active');
    $(this).addClass('active');
    activeChartIndx = $(this).index();
    showChart();
  });

  $(document).on('keyup', function(e) {

    $('.chart-inner').css('visibility', 'visible');
    if (e.keyCode === 13 && $userInput.is(':focus')) {
      userName = $userInput.val();

      getData();
    }
  });
}

$(init);

