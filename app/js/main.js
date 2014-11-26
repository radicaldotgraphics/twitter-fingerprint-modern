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

var Point = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

function renderCharCountChart(ctx, dataObj, renderOutlines) {
  var numPoints = Object.keys(dataObj).length,
    angleIncrement = (360 / numPoints),
    rad = Math.PI / 180;

  var i = 0,
    mult = utils.getDistMult(dataObj, drawConfig.radius * 0.5),
    minOffset = 41;

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
  ctx.closePath();

  // Mask the inside
  ctx.beginPath();
  ctx.globalCompositeOperation = 'destination-out'
  ctx.arc(drawConfig.centerX, drawConfig.centerY, 40, 0, 2 * Math.PI, true);
  ctx.fill();
  ctx.closePath();

  // Restore composite mode
  ctx.globalCompositeOperation = 'source-over';

  i = 0;
  ctx.font = '8pt HelveticaNeue-Light';
  ctx.fillStyle = '#76787A';
  ctx.strokeStyle = '#76787A';
  ctx.textAlign = 'center';
  ctx.lineWidth = 1;

  ctx.beginPath();
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
        if (i === 139) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = '#76787A';
        }
        ctx.fillText(i + 1, textX, textY);
        ctx.strokeStyle = '#ffffff';
      } else {
        ctx.strokeStyle = '#76787A';
      }

      ctx.moveTo(xx, yy);
      ctx.lineTo(xxx, yyy);
      ctx.stroke();
    }
    ctx.closePath();
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
    minOffset = 41; // Inner circle

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
  ctx.fillStyle = 'rgba(0, 173, 239, 0.25)';
  ctx.fill();

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
  }

  drawTrianlgeMarker(highestPoint, ctx);
  //console.log('highestVal:', highestVal, highestPoint);

}

function renderMostUsedCharacterChart(ctx, dataObj, renderOutlines) {
  var chars = utils.getCharacters();

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

  var mostUsedCtx = document.getElementById('most-used-markers').getContext('2d');
  mostUsedCtx.clearRect(0, 0, 500, 650);

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

      if (i < 26 || i > 33 && i < 44 || i > 28 && i < 30) {
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
  }

  drawMarkers(models.mostUsedMarkers, mostUsedCtx);

  ctx.stroke();

}

function drawMarkers(points, ctx) {

  for (var i = 0; i < points.length; i++) {
    var point = points[i];
    //console.log('drawing point', point.x, point.y);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(3, 161, 220, 1)';
    ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
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
  renderCharCountChart(document.getElementById('character-counts').getContext('2d'), models.charCount, true);
  renderTimeOfDayChart(document.getElementById('time-of-day').getContext('2d'), models.timeOfDay, false);
  renderMostUsedCharacterChart(document.getElementById('most-used').getContext('2d'), models.mostUsedChar, false);

  $('#time-of-day, #most-used, #most-used-markers').hide();

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

  var fA = datGUI.addFolder('Chart A');

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

  fA.open();

  var ChartBConfig = new(function() {
    this.chartVisible = false;
    this.outerVisible = false;
  });

  var fB = datGUI.addFolder('Chart B');
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
  fB.open();

  var ChartCConfig = new(function() {
    this.chartVisible = false;
    this.outerVisible = false;
  });

  var fC = datGUI.addFolder('Chart sC');
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
  fC.open();
}

function addCenterX() {
  var ctx = document.getElementById('background').getContext('2d');
  ctx.font = '5pt HelveticaNeue-Light';
  ctx.fillStyle = '#76787A';
  ctx.textAlign = 'center';
  ctx.fillText('X', drawConfig.centerX, drawConfig.centerY + 2);
}

function addUserNameTextToBackgroundLayer() {
  var ctx = document.getElementById('background').getContext('2d');
  ctx.font = '14pt HelveticaNeue-Light';
  ctx.fillStyle = '#76787A';
  ctx.textAlign = 'left';
  ctx.fillText('@' + hardCodedTwitterUserForTestingLocally, 15, 30);
}

function init() {
  var promise = $.getJSON('/api/timeline?screen_name=' + hardCodedTwitterUserForTestingLocally);
  promise.then(function(data) {
    parseData(data);
  });

  addUserNameTextToBackgroundLayer();
  addCenterX();

  setupGUI();
}

$(init);
