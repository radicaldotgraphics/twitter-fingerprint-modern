'use strict';

require('../js/vendor/dat.gui.min.js');

var $ = require('jquery'),
  utils = require('./utils'),
  hardCodedTwitterUserForTestingLocally = 'tylermadison',
  locStr = window.location.href.toString(),
  user = locStr.substr(locStr.indexOf('@') + 1);

if (user.length) {
  hardCodedTwitterUserForTestingLocally = user;
  console.log(user);
}

//////////////////////////////////////////////////////////
// CONSTANTS

// Common draw variables
var DrawConfig = {
  CANVAS_WIDTH: 500,
  CANVAS_HEIGHT: 650,
  RADIUS: 335,
  CENTER_X: 250,
  CENTER_Y: 325
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

// TODO: add canvas element names as constants
// var CanvasClassIds = {}

// END CONSTANTS
///////////////////////////////////////////////////////////

// When data parses store in hash
var models = {};

// Convenience cartesian point object
var Point = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

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

    charCountLines.push({
      start: startPoint,
      end: endPoint
    });

    i++;
  }

  // Draw lines extruding from center
  drawLines(charCountLines, 1, Colors.PINK, ctx);
  $('#character-counts').addClass('trigger');

  ctx.font = '8pt HelveticaNeue-Light';
  ctx.fillStyle = Colors.GRAY;
  ctx.strokeStyle = Colors.GRAY;
  ctx.textAlign = TextAlign.CENTER;

  // Draw tick marks around circumference
  //
  if (renderOutlineMarkers) {
    for (var i = 0; i < numPoints; i++) {
      ctx.beginPath();
      var circRadius = 222,
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

}

function renderTimeOfDayChart(ctx, dataObj, renderOutlines) {
  var numPoints = Object.keys(dataObj).length,
    angleIncrement = (360 / numPoints),
    rad = Math.PI / 180;

  var i = 0,
    startX = -1,
    startY = -1,
    lastX = -1,
    lastY = -1,
    mult = utils.getDistMult(dataObj, DrawConfig.RADIUS - 225),
    minOffset = 41; // Inner circle

  // console.log('Using Multiplyer :: ', mult);

  ctx.clearRect(0, 0, DrawConfig.CANVAS_WIDTH, DrawConfig.CANVAS_HEIGHT);

  ctx.beginPath();

  //console.log('Rendering time of day: ', dataObj);

  var highestVal = -1,
    highestPoint = null;

  for (var key in dataObj) {
    var amount = dataObj[key],
      angleStep = (angleIncrement * i - 90),
      currX = ((mult * amount + minOffset) * Math.cos(angleStep * rad)),
      currY = ((mult * amount + minOffset) * Math.sin(angleStep * rad));

    if (startX === -1 && startY === -1) {
      startX = DrawConfig.CENTER_X + currX;
      startY = DrawConfig.CENTER_Y + currY;
    }

    // Next point to draw to
    var nextX = ((mult * amount + minOffset) * Math.cos(angleStep * rad)),
      nextY = ((mult * amount + minOffset) * Math.sin(angleStep * rad));

    if (i === numPoints) {
      ctx.lineTo(startX, startY); // Gets back to home to fill
    } else {
      if (i === 0) {

        lastX = DrawConfig.CENTER_X + nextX;
        lastY = DrawConfig.CENTER_Y + nextY;

        ctx.moveTo(DrawConfig.CENTER_X + currX, DrawConfig.CENTER_Y + currY);
        ctx.lineTo(lastX, lastY);

      } else {
        lastX = DrawConfig.CENTER_X + nextX;
        lastY = DrawConfig.CENTER_Y + nextY;

        ctx.lineTo(lastX, lastY);
      }
    }

    if (amount > highestVal) {
      highestVal = amount;
      highestPoint = new Point(DrawConfig.CENTER_X + currX, DrawConfig.CENTER_Y + currY);
    }

    i++;
  }

  ctx.closePath();
  ctx.fillStyle = Colors.TIME_OF_DAY_FILL;
  ctx.fill();

  // Draw tick marks around circumference
  if (renderOutlines) {
    for (var i = 0; i < numPoints; i++) {
      ctx.beginPath();
      var circRadius = 180,
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

  drawTrianlgeMarker(highestPoint, ctx);
  //console.log('highestVal:', highestVal, highestPoint);

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

  var mostUsedCtx = document.getElementById('most-used-markers').getContext('2d');
  mostUsedCtx.clearRect(0, 0, DrawConfig.CANVAS_WIDTH, DrawConfig.CANVAS_HEIGHT);

  ctx.clearRect(0, 0, DrawConfig.CANVAS_WIDTH, DrawConfig.CANVAS_HEIGHT);

  ctx.beginPath();

  for (var i = 0; i < chars.length; i++) {

    var amount = dataObj[chars[i]] || 0,
      angleStep = (angleIncrement * i - 90),
      currX = ((mult * amount + minOffset) * Math.cos(angleStep * rad)),
      currY = ((mult * amount + minOffset) * Math.sin(angleStep * rad));

    //console.log('plotting: ', chars[i], dataObj[chars[i]] || 0);

    if (startX === -1 && startY === -1) {
      startX = DrawConfig.CENTER_X + currX;
      startY = DrawConfig.CENTER_Y + currY;
    }

    // Next point to draw to
    var nextX = ((mult * amount + minOffset) * Math.cos(angleStep * rad)),
      nextY = ((mult * amount + minOffset) * Math.sin(angleStep * rad));

    if (i === numPoints) {
      ctx.lineTo(startX, startY); // Gets back to home to fill
    } else {
      if (i === 0) {
        lastX = DrawConfig.CENTER_X + nextX;
        lastY = DrawConfig.CENTER_Y + nextY;
        ctx.moveTo(DrawConfig.CENTER_X + currX, DrawConfig.CENTER_Y + currY);
        ctx.lineTo(lastX, lastY);
        markers.push(new Point(lastX, lastY));
      } else {
        lastX = DrawConfig.CENTER_X + nextX;
        lastY = DrawConfig.CENTER_Y + nextY;
        ctx.lineTo(lastX, lastY);
        markers.push(new Point(lastX, lastY));
      }
    }
  }

  ctx.closePath();

  ctx.fillStyle = Colors.MOST_USED_FILL;
  ctx.fill();

  ctx.fillStyle = Colors.GRAY;
  ctx.beginPath();

  if (renderOutlines) {
    for (var i = 0; i < chars.length; i++) {
      var circRadius = 222,
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

  drawMarkers(markers, mostUsedCtx);

  ctx.stroke();

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

function animateLine(line, lineWidth, color, ctx) {
  var speed = 0.00009;

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

function drawLines(lines, lineWidth, color, ctx) {

  if (!ctx) {
    throw new Error('Main: drawLines method: must pass a canvas element context 2d');
  }

  //ctx.strokeStyle = color || Colors.GREEN;
  //ctx.lineWidth = lineWidth || 1;
  //ctx.beginPath();

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    //ctx.moveTo(line.start.x, line.start.y);
    //ctx.lineTo(line.end.x, line.end.y);
    animateLine(line, lineWidth, color, ctx);
  }

  //ctx.stroke();
  //ctx.closePath();

  //console.log('drawing line to:', line.start.x, line.start.y, ' to: ', line.end.x, line.end.y);
}

function drawMarkers(points, ctx) {

  for (var i = 0; i < points.length; i++) {
    var point = points[i];
    //console.log('drawing point', point.x, point.y);
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
  renderCharCountChart(document.getElementById('character-counts').getContext('2d'), models.charCount, true);
  renderTimeOfDayChart(document.getElementById('time-of-day').getContext('2d'), models.timeOfDay, false);
  renderMostUsedCharacterChart(document.getElementById('most-used').getContext('2d'), models.mostUsedChar, false);

  $('#time-of-day, #most-used, #most-used-markers').hide();

  drawCenterX();

}

function setupGUI() {

  var DatGUIConfig = function() {
    this.showMerged = false;
  };

  var config = new DatGUIConfig(),
    datGUI = new dat.GUI();

  var ChartAConfig = new(function() {
    this.chartVisible = true;
    this.outerVisible = true;
  });

  var fA = datGUI.addFolder('Character Count');

  fA.add(ChartAConfig, 'chartVisible').onChange(function(newVal) {
    var $el = $('#character-counts');
    if (newVal) {
      $el.fadeIn(350);
    } else {
      $el.fadeOut(250);
    }
  });

  fA.add(ChartAConfig, 'outerVisible').onChange(function(newVal) {
    renderCharCountChart(document.getElementById('character-counts').getContext('2d'), models.charCount, newVal);
  });

  //fA.open();

  var ChartBConfig = new(function() {
    this.chartVisible = false;
    this.outerVisible = false;
  });

  var fB = datGUI.addFolder('Time of Day');
  fB.add(ChartBConfig, 'chartVisible').onChange(function(newVal) {
    var $el = $('#time-of-day');
    if (newVal) {
      $el.fadeIn(350);
    } else {
      $el.fadeOut(250);
    }
  });
  fB.add(ChartBConfig, 'outerVisible').onChange(function(newVal) {
    renderTimeOfDayChart(document.getElementById('time-of-day').getContext('2d'), models.timeOfDay, newVal);
  });
  //fB.open();

  var ChartCConfig = new(function() {
    this.chartVisible = false;
    this.outerVisible = false;
  });

  var fC = datGUI.addFolder('Most Used Character');
  fC.add(ChartCConfig, 'chartVisible').onChange(function(newVal) {
    var $elems = $('#most-used, #most-used-markers');
    if (newVal) {
      $elems.fadeIn(350);
    } else {
      $elems.fadeOut(250);
    }
  });
  fC.add(ChartCConfig, 'outerVisible').onChange(function(newVal) {
    renderMostUsedCharacterChart(document.getElementById('most-used').getContext('2d'), models.mostUsedChar, newVal);
  });
  //fC.open();
}

function drawCenterX() {
  var ctx = document.getElementById('background').getContext('2d');
  ctx.font = '5pt HelveticaNeue-Light';
  ctx.fillStyle = '#76787A';
  ctx.textAlign = TextAlign.CENTER;
  ctx.fillText('X', DrawConfig.CENTER_X, DrawConfig.CENTER_Y + 2);
}

function addUserNameTextToBackgroundLayer() {
  var ctx = document.getElementById('background').getContext('2d');
  ctx.font = '14pt HelveticaNeue-Light';
  ctx.fillStyle = '#76787A';
  ctx.textAlign = TextAlign.LEFT;
  ctx.fillText('@' + hardCodedTwitterUserForTestingLocally, 15, 30);
}

function getData() {
  var promise = $.getJSON('/api/timeline?screen_name=' + hardCodedTwitterUserForTestingLocally);
  promise.then(function(data) {
    parseData(data);
  });
}

function init() {
  //addUserNameTextToBackgroundLayer();
  $('.radio').on('click', function(){
    $(this).toggleClass('selected');
  });
  setupGUI();
  getData();
}

$(init);
