/**
 * A semi sort of directive for the radio options
 * @param {Object} $el jQuery wrapped element
 */

var $ = require('jquery');

var ChartOption = function($el, cb) {
  this.$el = $el;
  this.selectorStr = this.$el.data('chartParts');

  if (this.$el.hasClass('is-data-toggle')) {
    this.isToggle = true;
    this.callBack = cb;
  }

  this.init();
};

ChartOption.prototype = {
  constructor: ChartOption,

  init: function() {
    this.$el.on('click', this.handleClick.bind(this));
  },

  handleClick: function(e) {
    this.$el.toggleClass('selected');

    if (this.$el.hasClass('selected')) {

      if (this.isToggle) {
        this.callBack(this.selectorStr, true);
      } else {
        $(this.selectorStr).show();
      }

    } else {

      if (this.isToggle) {
        this.callBack(this.selectorStr, false);
      } else {
        $(this.selectorStr).hide();
      }
    }
  }
}

module.exports = ChartOption;

