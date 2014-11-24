'use strict';

// Vendor
require('../js/vendor/ba-linkify.min.js');
require('../js/vendor/easeljs-0.7.1.min.js');

var $ = require('jquery'),
  ENTER_BUTTON_KEY = 13,
  currentCount = {},
  charCounts = {},
  markers = [];

// Artboard
var artBoard = {
  /**
   * Setup artboard
   */
  init: function() {
    this.stage = new createjs.Stage('artboard');

    this.drawConfig = {
      circleRadius: 370,
      centerx: 433,
      centery: 457,
      lineStrokeColor: '#747249'
    };

    this.fillBackground();

  },

  /**
   * Performs drawing methods on the stage
   */
  render: function(currData) {
    // Add heat map
    this.stage.removeAllChildren();
    this.stage.clear();
    this.stage.update();

    this.fillBackground();
    this.drawHeatMap(currData);
    this.drawCenterFill();
    this.drawCircularLines(currData);
  },

  reset: function(){
    this.stage.removeAllChildren();
    this.stage.clear();
    this.stage.update();
    this.fillBackground();
  },


  /**
   * Draws through the points in the data set creating a polygon filled shape
   */
  drawHeatMap: function(dataSet) {

    var numberOfPoints = Object.keys(dataSet).length,
      angleIncrement = (360 / numberOfPoints);

    var centerCircleBG = new createjs.Shape();
    centerCircleBG.graphics.beginFill('#e9e6b1').drawCircle(this.drawConfig.centerx, this.drawConfig.centery, this.drawConfig.circleRadius - 30);
    this.stage.addChild(centerCircleBG);

    var heatMap = new createjs.Shape();
    heatMap.graphics.beginLinearGradientFill(['#ddd43b', '#d28044', '#ce4c4c'], [0, 0.5, 1], 100, 100, 0, 600);

    var i = 0,
      startX = -1,
      startY = -1,
      lastX = -1,
      lastY = -1,
      mult = this.getPXMult(dataSet),
      minOffset = 140; // Inner circle

    console.log('Using Multiplyer :: ', mult);

    for (var count in dataSet) {
      var amount = dataSet[count],
        currX = ((mult * amount + minOffset) * Math.cos((angleIncrement * i - 90) * (Math.PI / 180))),
        currY = ((mult * amount + minOffset) * Math.sin((angleIncrement * i - 90) * (Math.PI / 180)));

      if (startX === -1 && startY === -1) {
        startX = this.drawConfig.centerx + currX;
        startY = this.drawConfig.centery + currY;
      }

      // Next point to draw to
      var nextX = ((mult * amount + minOffset) * Math.cos((angleIncrement * i - 90) * (Math.PI / 180))),
        nextY = ((mult * amount + minOffset) * Math.sin((angleIncrement * i - 90) * (Math.PI / 180)));

      if (i === numberOfPoints) {
        heatMap.graphics.lt(startX, startY); // Gets back to home to fill
      } else {
        if (i === 0) {
          heatMap.graphics.mt(this.drawConfig.centerx + currX, this.drawConfig.centery + currY).lt(this.drawConfig.centerx + nextX, this.drawConfig.centery + nextY);

          lastX = this.drawConfig.centerx + nextX;
          lastY = this.drawConfig.centery + nextY;

          artBoard.markPoint(this.drawConfig.centerx + currX, this.drawConfig.centery + currY, true);

        } else {
          heatMap.graphics.lt(this.drawConfig.centerx + nextX, this.drawConfig.centery + nextY);
          lastX = this.drawConfig.centerx + nextX;
          lastY = this.drawConfig.centery + nextY;
        }
        artBoard.markPoint(this.drawConfig.centerx + nextX, this.drawConfig.centery + nextY);
      }

      i++;

      console.log(count, amount);
    }

    this.stage.addChild(heatMap);

    // Add point markers
    for (var j = 0; j < markers.length; j++) {
      this.stage.addChild(markers[j]);
    }

    this.stage.update();
  },

  /**
   * Places a dot at the x,y coordinate provided
   * @param  {Number} x     horizontal coordinate of point
   * @param  {Number} y     vertical coordinate of point
   * @param  {Boolean} first if true will change color to red indicating the first point
   */
  markPoint: function(x, y, first) {
    var spot = new createjs.Shape();
    spot.graphics.beginFill(first ? '#ff0000' : '#1e1e1e');
    spot.graphics.arc(x, y, 1, 0, 2 * Math.PI, false);
    markers.push(spot);
  },

  /**
   * Draws background gradient
   */
  fillBackground: function() {
    var bg = new createjs.Shape();
    bg.graphics.beginLinearGradientFill(['#e9c79a', '#84d3a4'], [0.35, 1], 0, 483, 866, 383);
    bg.graphics.dr(0, 0, 1732, 2330);
    this.stage.addChild(bg);

    this.stage.update();
  },

  /**
   * Draws center circle(s) and acts as a mask on top of the heatmap
   */
  drawCenterFill: function() {
    var centerCircle = new createjs.Shape();
    centerCircle.alpha = 1;
    centerCircle.graphics.beginFill('#e9e6b1');
    centerCircle.graphics.arc(this.drawConfig.centerx, this.drawConfig.centery, this.drawConfig.circleRadius - 250, 0, 2 * Math.PI, false);

    centerCircle.graphics.setStrokeStyle(0.25, 'round');
    centerCircle.graphics.beginStroke(this.drawConfig.lineStrokeColor);
    centerCircle.graphics.arc(this.drawConfig.centerx, this.drawConfig.centery, this.drawConfig.circleRadius - 270, 0, 2 * Math.PI, false);
    centerCircle.graphics.endStroke();

    this.stage.addChild(centerCircle);

    var centerCircleOuter = new createjs.Shape();
    centerCircleOuter.graphics.setStrokeStyle(0.25, 'round');
    centerCircleOuter.graphics.beginStroke(this.drawConfig.lineStrokeColor);
    centerCircleOuter.graphics.arc(this.drawConfig.centerx, this.drawConfig.centery, this.drawConfig.circleRadius - 100, 0, 2 * Math.PI, false);

    centerCircleOuter.graphics.endStroke();
    this.stage.addChild(centerCircleOuter);

    this.stage.update();
  },

  // Pixel multipler normalization
  getPXMult: function(obj) {
    var max = -1;
    for (var val in obj) {
      if (obj[val] > max) {
        max = obj[val];
      }
    }
    console.log('max =>', max);
    return 200 / max; // This 200 should be a calculation not a hardcoded number...
  },

  /**
   * Draws lines beneath the heatmap
   * @param  {Object} dataSet the current data has been chosen
   */
  drawCircularLines: function(dataSet) {

    var numPoints = Object.keys(dataSet).length,
      angleIncrement = 360 / numPoints;

    for (var i = 0; i < numPoints; i++) {

      var container = new createjs.Container();

      var shape = new createjs.Shape();

      container.addChild(shape);

      var xx = (this.drawConfig.circleRadius * Math.cos((angleIncrement * i - 90) * (Math.PI / 180))),
        xxx = ((this.drawConfig.circleRadius * 0.95) * Math.cos((angleIncrement * i - 90) * (Math.PI / 180))),
        yy = (this.drawConfig.circleRadius * Math.sin((angleIncrement * i - 90) * (Math.PI / 180))),
        yyy = ((this.drawConfig.circleRadius * 0.95) * Math.sin((angleIncrement * i - 90) * (Math.PI / 180))),
        rad = Math.atan2(yy, xx),
        deg = rad * (180 / Math.PI);

      container.x = xx + this.drawConfig.centerx;
      container.y = yy + this.drawConfig.centery;
      container.rotation = deg;

      var tf = new createjs.Text(i + 1, '9px Arial', '#555452');
      tf.rotation = 90;
      tf.textAlign = 'center';

      container.addChild(tf);

      var line = new createjs.Shape();
      line.graphics.setStrokeStyle(0.25, 'round');
      line.graphics.beginStroke(this.drawConfig.lineStrokeColor);
      line.graphics.mt(this.drawConfig.centerx + ((this.drawConfig.circleRadius - 250) * Math.cos((angleIncrement * i - 90) * (Math.PI / 180))), this.drawConfig.centery + ((this.drawConfig.circleRadius - 250) * Math.sin((angleIncrement * i - 90) * (Math.PI / 180)))).lt(this.drawConfig.centerx + xxx, this.drawConfig.centery + yyy);
      line.graphics.endStroke();
      this.stage.addChild(line);

      this.stage.addChild(container);
    }

    this.stage.update();
  }

}

// Formatting utils etc
var utils = {
  formatDate: function(str) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var date = new Date(str),
      dateStr = '',
      hours = date.getHours(),
      minutes = date.getMinutes();

    dateStr += months[date.getMonth()];
    dateStr += ' ' + date.getDate() + ', ';
    dateStr += date.getFullYear() + ' ';
    var hoursCalc = (hours > 12 ? hours - 12 : hours);
    var hoursAdj = hoursCalc === 0 ? 12 : hoursCalc;
    dateStr += hoursAdj + ':' + (minutes < 10 ? '0' + minutes : minutes) + (hours >= 12 ? 'pm' : 'am');
    return dateStr;
  },

  getHours: function(dateStr) {
    return ((new Date(dateStr)).getHours() + 1).toString();
  },

  getCharCount: function(tweet) {
    return tweet.length.toString();
  }

}

function parseTweets(data) {

  currentCount = {};
  charCounts = {};
  markers = [];

  $.each(data.tweets, function(i, tweet) {
    var date = new Date(tweet.created_at);
    /*    var dateStr =
          $('<p> - ' + window.linkify(tweet.text) + ' on ' + utils.formatDate(tweet.created_at) + '</p>').appendTo($('.results'));*/

    // For time of day
    if (currentCount[utils.getHours(tweet.created_at)] === undefined) {
      currentCount[utils.getHours(tweet.created_at)] = 0;

    } else {
      currentCount[utils.getHours(tweet.created_at)] ++;
    }

    // For character counts
    if (charCounts[utils.getCharCount(tweet.text)] === undefined) {
      charCounts[utils.getCharCount(tweet.text)] = 1;
    } else {
      charCounts[utils.getCharCount(tweet.text)] ++;
    }

  });

  // Fill in blanks
  for (var i = 1; i <= 24; i++) {
    if (!currentCount[i]) {
      currentCount[i] = 0;
    }
  }

  // Fill in blanks
  for (var i = 1; i <= Object.keys(charCounts).length; i++) {
    if (!charCounts[i]) {
      charCounts[i] = 0;
    }
  }
}

function handleSubmit() {

  var p = $.getJSON('http://localhost:5000/api/timeline?screen_name=' + $('.user-input').val());

  // Clear previous results if any
  //$('.results').empty();
  //
  artBoard.reset();

  p.then(function(data) {
    parseTweets(data);
    artBoard.render(charCounts);
  });
}

// FPO
$('.submit-btn').on('click', handleSubmit.bind(this));

$(document).on('keyup', function(e) {

  if (e.keyCode === ENTER_BUTTON_KEY) {
    if ($('.user-input').val().length > 0) {
      handleSubmit();
    }
  }
});

// REMOVE THIS
$(function() {
  artBoard.init();
});
