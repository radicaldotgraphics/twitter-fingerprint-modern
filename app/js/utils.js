'use strict';

module.exports = {

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
  },

  getDistMult: function(obj, dist) {
    var max = -1;
    for (var val in obj) {
      if (obj[val] > max) {
        max = obj[val];
      }
    }
    return dist / max;
  }

};
