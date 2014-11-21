'use strict';

// Vendor
require('../js/vendor/ba-linkify.min.js');
require('../js/vendor/easeljs-0.7.1.min.js');

var $ = require('jquery');

var ENTER_BUTTON_KEY = 13;

var charStage = new createjs.Stage('characters');

var charStageBG = new createjs.Shape();

charStageBG.graphics.beginLinearGradientFill(['#e9c79a', '#84d3a4'], [0.35, 1], 0, 483, 866, 383);

charStageBG.graphics.dr(0, 0, 866, 1165);

charStage.addChild(charStageBG);

function formatDate(str) {
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

}

function getHours(dateStr) {
  return ((new Date(dateStr)).getHours() + 1).toString();
}

function getCharCount(tweet) {
  return tweet.length.toString();
}

var currentCount = {};
var charCounts = {};

function handleSubmit() {
  var p = $.getJSON('http://localhost:5000/api/timeline?screen_name=' + /*$('.user-input').val()*/ 'tylermadison');

  // Clear previous results if any
  $('.results').empty();

  $('.pre-loader').css('opacity', 1);

  p.then(function(data) {
    $('.pre-loader').css('opacity', 0);
    console.log('we aint afraid of no ghost', data);

    $.each(data.tweets, function(i, tweet) {
      var date = new Date(tweet.created_at);
      var dateStr =
        $('<p> - ' + window.linkify(tweet.text) + ' on ' + formatDate(tweet.created_at) + '</p>').appendTo($('.results'));

      // For time of day
      if (currentCount[getHours(tweet.created_at)] === undefined) {
        currentCount[getHours(tweet.created_at)] = 1;

      } else {
        currentCount[getHours(tweet.created_at)] ++;
      }

      // For character counts
      if (charCounts[getCharCount(tweet.text)] === undefined) {
        charCounts[getCharCount(tweet.text)] = 1;
      } else {
        charCounts[getCharCount(tweet.text)] ++;
      }

    });

    // Fill in blanks
    for (var i = 1; i <= 24; i++) {
      if (!currentCount[i]) {
        currentCount[i] = 0;
      }
    }

    // Fill in blanks
    for (var i = 1; i <= 140; i++) {
      if (!charCounts[i]) {
        charCounts[i] = 0;
      }
    }

    // Fugly results
    /*    $('<h1>Volume:</h1>').appendTo($('.results'));

        for (var hour in currentCount) {
          var volumePerHour = currentCount[hour];

          $('<p>' + 'Volume During ' + hour + '=> ' + volumePerHour + '</p>').appendTo($('.results'));
        }

        $('<h1>Characters:</h1>').appendTo($('.results'));

        for (var characters in charCounts) {
          var charAmt = charCounts[characters];

          $('<p>' + 'Volume of Amount of Characters ' + characters + '=> ' + charAmt + '</p>').appendTo($('.results'));
        }*/

    $('#characters, .inspiration').show();

    // Easle stuff
    var numberOfPoints = 24,
      angleIncrement = (360 / numberOfPoints),
      circleRadius = 370,
      centerx = 433,
      centery = 457;

    var strokeColor = '#747249';

    var centerCircleBG = new createjs.Shape();
    centerCircleBG.graphics.beginFill('#e9e6b1').drawCircle(centerx, centery, circleRadius - 30);
    charStage.addChild(centerCircleBG);

    var heatMap = new createjs.Shape();

    /*    var grd = document.get.createLinearGradient(0, 0, 170, 0);
        grd.addColorStop(0, "black");
        grd.addColorStop(1, "white");

        ctx.fillStyle = grd;*/

    //heatMap.graphics.beginFill('#d8be45');
    heatMap.graphics.beginLinearGradientFill(['#ddd43b', '#d28044', '#ce4c4c'], [0, 0.5, 1], 100, 100, 0, 600);
    //heatMap.graphics.beginStroke('#ff0000');
    var i = 0;

    var startX = -1;
    var startY = -1;

    var lastX = -1;
    var lastY = -1;

    for (var count in currentCount) {
      var time = count,
        amount = currentCount[count];

      var xxx = ((15 * amount) * Math.cos((angleIncrement * i - 90) * (Math.PI / 180)));
      var yyy = ((15 * amount) * Math.sin((angleIncrement * i - 90) * (Math.PI / 180)));

      i++;

      if (startX === -1 && startY === -1) {
        startX = centerx + xxx;
        startY = centery + yyy;
      }

      // Next point to draw to
      var nextXxx = ((15 * amount) * Math.cos((angleIncrement * i - 90) * (Math.PI / 180)));
      var nextYyy = ((15 * amount) * Math.sin((angleIncrement * i - 90) * (Math.PI / 180)));

      if (i === Object.keys(currentCount).length) {
        heatMap.graphics.lt(startX, startY); // Gets back to home to fill
      } else {
        if (i === 1) {
          heatMap.graphics.mt(centerx + xxx, centery + yyy).lt(centerx + nextXxx, centery + nextYyy);
          lastX = centerx + nextXxx;
          lastY = centery + nextYyy;
        } else {
          heatMap.graphics.lt(centerx + nextXxx, centery + nextYyy);
          lastX = centerx + nextXxx;
          lastY = centery + nextYyy;
        }

        //console.log(i, 'Drawing from:', centerx + xxx, centery + yyy, ' => ', centerx + nextXxx, centery + nextYyy);
      }

      console.log(time, amount);
    }

    charStage.addChild(heatMap);

    var centerCircle = new createjs.Shape();

    /*    centerCircle.graphics.beginFill('#e9e6b1');
        centerCircle.graphics.arc(centerx, centery, circleRadius - 250, 0, 2 * Math.PI, false);*/

    centerCircle.graphics.setStrokeStyle(0.25, 'round');
    centerCircle.graphics.beginStroke(strokeColor);
    centerCircle.graphics.arc(centerx, centery, circleRadius - 275, 0, 2 * Math.PI, false);
    centerCircle.graphics.endStroke();

    charStage.addChild(centerCircle);

    var centerCircleOuter = new createjs.Shape();
    centerCircleOuter.graphics.setStrokeStyle(0.25, 'round');
    centerCircleOuter.graphics.beginStroke(strokeColor);
    centerCircleOuter.graphics.arc(centerx, centery, circleRadius - 100, 0, 2 * Math.PI, false);

    centerCircleOuter.graphics.endStroke();
    charStage.addChild(centerCircleOuter);

    for (var i = 0; i < numberOfPoints; i++) {

      var cont = new createjs.Container();

      var shape = new createjs.Shape();

      cont.addChild(shape);

      var xx = (circleRadius * Math.cos((angleIncrement * i - 90) * (Math.PI / 180)));
      var xxx = ((circleRadius * 0.95) * Math.cos((angleIncrement * i - 90) * (Math.PI / 180)));
      var yy = (circleRadius * Math.sin((angleIncrement * i - 90) * (Math.PI / 180)));
      var yyy = ((circleRadius * 0.95) * Math.sin((angleIncrement * i - 90) * (Math.PI / 180)));
      var rad = Math.atan2(yy, xx);
      var deg = rad * (180 / Math.PI);

      cont.x = xx + centerx;
      cont.y = yy + centery;

      var tf = new createjs.Text(i + 1, '12px Arial', '#555452');
      tf.rotation = 90;
      tf.textAlign = 'center';
      tf.visible = false;
      cont.addChild(tf);

      var line = new createjs.Shape();
      line.graphics.setStrokeStyle(0.25, 'round');
      line.graphics.beginStroke(strokeColor);
      line.graphics.mt(centerx + ((circleRadius - 250) * Math.cos((angleIncrement * i - 90) * (Math.PI / 180))), centery + ((circleRadius - 250) * Math.sin((angleIncrement * i - 90) * (Math.PI / 180)))).lt(centerx + xxx, centery + yyy);
      line.graphics.endStroke();
      charStage.addChild(line);

      var len = currentCount[i];

      if (isNaN(len)) {
        len = 0;
      }

      cont.rotation = deg;

      if (len != 0) {
        shape.graphics.drawRect(0, 0, len * 20, 2);
        tf.visible = true;

      } else {
        tf.visible = true;
        tf.alpha = 0.4;
      }

      charStage.addChild(cont);
    }

    charStage.update();

  });
}

$('.submit-btn').on('click', handleSubmit.bind(this));

$(document).on('keyup', function(e) {

  if (e.keyCode === ENTER_BUTTON_KEY) {
    if ($('.user-input').val().length > 0) {
      handleSubmit();
    }

  }
});

$('#characters, .inspiration').hide();

// REMOVE THIS
$(function() {
  handleSubmit();
});

/*for (var i = 0; i < numberOfPoints; i++) {

  var c: Sprite = new Sprite();

  var xx = (circleRadius * Math.cos((angleIncrement * i - 90) * (Math.PI / 180)));
  var yy = (circleRadius * Math.sin((angleIncrement * i - 90) * (Math.PI / 180)));
  //
  var rad = Math.atan2(yy, xx);
  var deg = rad * (180 / Math.PI);

  var tf: MovieClip = new TextLabel();
  c.addChild(tf);

  tf.rotation = 90;
  tf.visible = false;
  tf.title_txt.text = String(i + 1);

  c.addChild(tf);

  c.x = xx + centerx;
  c.y = yy + centery;
  c.graphics.beginFill(0x000000, .5);

  var len = countArr[i];
  if (isNaN(len)) {
    len = 0;
  }

  c.rotation = deg;
  if (len != 0) {
    c.graphics.drawRect(0, 0, len * 20, 2);

    tf.visible = true;
  } else {
    tf.visible = true;
    tf.alpha = .2;
  }
  addChild(c);
}*/

/*console.log(stage);
var circle = new createjs.Shape();*/

// Draw circle like this or
/*circle.graphics.beginFill("red").drawCircle(0, 0, 50);
circle.x = 100;
circle.y = 100;
stage.addChild(circle);*/

// Or
/*stage.addChild(new createjs.Shape()).setTransform(100, 100).graphics.f('red').dc(0, 0, 50);
stage.addChild(circle);

var text = new createjs.Text('Hello World', '20px Arial', '#ff7700');
text.x = 100;
text.rotation = 40;
stage.addChild(text);*/

/////////
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
///
