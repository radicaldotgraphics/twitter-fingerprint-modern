'use strict';

var Handlebars = require('../js/vendor/handlebars-v2.0.0.js');

var $ = require('jquery'),
  utils = require('./utils'),
  Easing = require('./vendor/easing'),
  ChartOption = require('./chart-option'),
  userName = 'tylermadison',
  locStr = window.location.href.toString(),
  user = locStr.substr(locStr.indexOf('@') + 1);

// Draw config used as refernce points
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

var isAnimating = false;

var activeChartIndx = 1,
  stats = {},
  canvasIds = ['#time-of-day', '#character-counts', '#most-used, #most-used-markers'],
  models = {},
  charCountHighPoint = null,
  renderedIndividually = false,
  totalTweetCount = 0;

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
    charCountLines = [],
    highestVal = -1,
    highestPoint = null,
    totalAmount = 0,
    dfd = $.Deferred();

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

    totalAmount += (amount * key);

    charCountLines.push({
      start: startPoint,
      end: endPoint
    });

    if (amount > highestVal) {
      highestVal = amount;
      highestPoint = charCountHighPoint = endPoint;
    }

    i++;
  }

  // Draw lines extruding from center
  drawLines(charCountLines, 1, Colors.PINK, ctx, dfd);

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
  stats.averageTweetLength = Math.floor(totalAmount / totalTweetCount);

  return dfd.promise();

}

function renderTimeOfDayChart(ctx, dataObj, renderOutlines) {
  var numPoints = Object.keys(dataObj).length,
    angleIncrement = (360 / numPoints),
    rad = Math.PI / 180,
    angleOffset = 90 - (360 / numPoints),
    dfd = $.Deferred();

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
      pt = new Point(DrawConfig.CENTER_X + ((mult * amount + minOffset) * Math.cos(angleStep * rad)), DrawConfig.CENTER_Y + ((mult * amount + minOffset) * Math.sin(angleStep * rad)));

    if (amount < lowestAmount) {
      lowTime = key;
      lowestAmount = amount;
    }

    if (amount > highestVal) {
      peakTime = key;
      highestVal = amount;
      highestPoint = pt;
    }
    i++;
  }

  // Animation loop function

  var iteration = 25,
    totalIterations = 180,
    easingValue;

  function animate() {
    var i = 0,
      points = [];
    easingValue = Easing.easeInOutExpo(iteration, 0, 1, totalIterations);

    for (var key in dataObj) {
      var amount = dataObj[key],
        angleStep = (angleIncrement * i - angleOffset),
        pt = new Point(((mult * easingValue) * amount + minOffset) * Math.cos(angleStep * rad), ((mult * easingValue) * amount + minOffset) * Math.sin(angleStep * rad));

      points.push(pt);
      i++;
    }

    drawPoly(points, ctx, Colors.TIME_OF_DAY_FILL);

    if (iteration < totalIterations) {
      iteration++;
      requestAnimationFrame(animate);
    } else {
      drawTrianlgeMarker(highestPoint, ctx);

      dfd.resolve();
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

  stats.mostActiveTime = (peakTime % 12) + ':00 ' + (peakTime >= 12 ? 'PM' : 'AM');
  stats.leastActiveTime = (lowTime % 12) + ':00 ' + (lowTime >= 12 ? 'PM' : 'AM');

  requestAnimationFrame(animate);

  return dfd.promise();
}

function animateLine(line, lineWidth, color, ctx) {

  var iteration = 0,
    totalIterations = 39,
    easingValue;

  function animate() {
    easingValue = Easing.easeInOutQuart(iteration, 0, 1, totalIterations);

    ctx.strokeStyle = color || Colors.GREEN;
    ctx.lineWidth = lineWidth || 1;
    ctx.beginPath();
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.start.x + easingValue * (line.end.x - line.start.x), line.start.y + easingValue * (line.end.y - line.start.y));
    ctx.stroke();
    ctx.closePath();

    if (iteration < totalIterations) {
      iteration++;
      requestAnimationFrame(animate);
    } else if (line.end.x === charCountHighPoint.x && line.end.y === charCountHighPoint.y) {
      drawHighPointRect(line.end, ctx);
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
    rad = Math.PI / 180,
    dfd = $.Deferred();

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

  for (var i = 0; i < chars.length; i++) {

    var amount = dataObj[chars[i]] || 0,
      angleStep = (angleIncrement * i - 90),
      pt = new Point(DrawConfig.CENTER_X + (mult * amount + minOffset) * Math.cos(angleStep * rad), DrawConfig.CENTER_Y + (mult * amount + minOffset) * Math.sin(angleStep * rad));

    markers.push(pt);

    if (amount > highestVal) {
      mostUsedChar = chars[i].toUpperCase();
      highestVal = amount;
      highestPoint = pt;
    }
  }

  // Animation loop function
  var iteration = 25,
    totalIterations = 170,
    easingValue;

  function animate() {
    var points = [];

    easingValue = Easing.easeInOutExpo(iteration, 0, 1, totalIterations);

    for (var i = 0; i < chars.length; i++) {
      var amount = dataObj[chars[i]] || 0,
        angleStep = (angleIncrement * i - 90),
        pt = new Point(((mult * easingValue) * amount + minOffset) * Math.cos(angleStep * rad), ((mult * easingValue) * amount + minOffset) * Math.sin(angleStep * rad));

      points.push(pt);
    }

    drawPoly(points, ctx, Colors.MOST_USED_FILL);

    if (iteration < totalIterations) {
      iteration++;
      requestAnimationFrame(animate);
    } else {

      drawHighPointCirc(highestPoint, ctx);
      dfd.resolve();
    }

    if (easingValue > 0.85) {
      drawMarkers(markers, mostUsedCtx);
    }

  }

  if (renderOutlines) {
    ctx.fillStyle = Colors.GRAY;
    ctx.beginPath();
    for (var i = 0; i < chars.length; i++) {
      var amount = dataObj[chars[i]] || 0;

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

      if (amount === 0) {
        ctx.fillStyle = Colors.GRAY;
      } else {
        ctx.fillStyle = Colors.WHITE;
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

  return dfd.promise();
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

function drawLines(lines, lineWidth, color, ctx, dfd) {

  if (!ctx) {
    throw new Error('Main: drawLines method: must pass a canvas element context 2d');
  }

  var delay = 0,
    i = 0;

  var delayedCb = function() {
    setTimeout(function() {
      animateLine(lines[i], lineWidth, color, ctx);
      if (i < lines.length - 1) {
        delay += 0.1;
        delayedCb();
        i++;
      } else {
        dfd.resolve();
      }
    }, delay);
  }

  delayedCb();
}

/**
 * [drawMarkers description]
 * @param  {[type]} points [description]
 * @param  {[type]} ctx    [description]
 * @return {[type]}        [description]
 */
function drawMarkers(points, ctx) {

  var delay = 0,
    i = 0;

  var delayedCb = function() {
    setTimeout(function() {
      var point = points[i];
      ctx.beginPath();
      ctx.strokeStyle = Colors.BRIGHT_BLUE;
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.stroke();
      if (i < points.length - 1) {
        delay = 10;
        delayedCb();
        i++;
      }
    }, delay);
  }

  delayedCb();

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

function showError(mssg) {
  // Showing error
  //
  $('.error-mssg').html(mssg).fadeIn(250);

  setTimeout(function() {
    $('.error-mssg').fadeOut(250);
  }, 4000);

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

  totalTweetCount = data.tweets.length;

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

  renderAllChartsTogether()

  drawCenterX();

  stats.tweetCount = data.tweets.length;

  var $tmplEl = $('#stats-tmpl'),
    source = $tmplEl.html(),
    html = Handlebars.compile(source)(stats);

  $('#stats').html(html);

}

function showChart() {

  $('canvas, .stat').removeClass('active');

  $('.intro').hide();

  setTimeout(function() {

    renderedIndividually = true;

    $.when(renderCharCountChart(document.getElementById('character-counts').getContext('2d'), models.charCount, true),
        renderTimeOfDayChart(document.getElementById('time-of-day').getContext('2d'), models.timeOfDay, true),
        renderMostUsedCharacterChart(document.getElementById('most-used').getContext('2d'), models.mostUsedChar, true))
      .done(
        function() {
          //console.log('animation complete?');
          isAnimating = false;
        });

    $(canvasIds[activeChartIndx]).addClass('active');
    $(canvasIds[activeChartIndx]).addClass('active');
    $('.btn-toggle').eq(activeChartIndx).addClass('active');
    $('.stat').eq(activeChartIndx).addClass('active');
    $('#top-layer').addClass('active');

  }, 350);

  isAnimating = true;

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

  isAnimating = false;

  var promise = $.getJSON('/api/timeline?screen_name=' + userName);
  $('.spinner').show();
  promise.then(function(data) {

    if (data.error) {
      showError('This user does not exist.');
      return;
    }

    if (data.tweets && data.tweets.length) {
      $('.chart-inner, .info').css('visibility', 'visible');
      parseData(data);
    } else {
      showError('This user has never tweeted!');
    }

    $('.spinner').hide();
  });
}

function reset() {
  renderedIndividually = false;
  activeChartIndx = -1;
  stats = {};
  totalTweetCount = 0;
  $('.btn-toggle').removeClass('active');

  $('.chart-inner, .info').css('visibility', 'hidden');
}

function renderAllChartsTogether() {
  // Render time of day chart to the timeof day canvas element

  $.when(renderCharCountChart(document.getElementById('character-counts').getContext('2d'), models.charCount, false),
      renderTimeOfDayChart(document.getElementById('time-of-day').getContext('2d'), models.timeOfDay, false),
      renderMostUsedCharacterChart(document.getElementById('most-used').getContext('2d'), models.mostUsedChar, false))
    .done(
      function() {
        // console.log('animation complete?');
        isAnimating = false;
      });

  setTimeout(function() {
    $(canvasIds[0]).addClass('active');
    $(canvasIds[1]).addClass('active');
    $(canvasIds[2]).addClass('active');
  }, 250);

  isAnimating = true;
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

    if (isAnimating) {
      return;
    }

    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
      renderedIndividually = false;
      activeChartIndx = -1;

      renderAllChartsTogether();

    } else {
      $('.btn-toggle').removeClass('active');
      $(this).addClass('active');
      activeChartIndx = $(this).index();
      showChart();
    }

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

