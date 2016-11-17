/**
 * Copy/paste this code into a bookmarklet in order to show credit full screen.
 *
 * Refresh page to revert view.
 */

/**

var overlay = $('<div class="overlay"></div>')
  .css({
    'position': 'fixed',
    'top': '0',
    'left': '0',
    'height': '100%',
    'width': '100%',
    'backgroundColor': '#000',
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'zIndex': '100000'
  })
  .appendTo('body');

var status;

setInterval(function() {
  if (status) {
    status.remove();
  }
  status = $('.current-frame-status').clone()
    .removeClass('current-frame-status')
    .appendTo('.overlay')
    .css({
      'fontSize': '3vw',
      'color': '#fff'
    });
}, 1000);

**/


javascript:void%20function(){{var%20e;$('%3Cdiv%20class=%22overlay%22%3E%3C/div%3E').css({position:%22fixed%22,top:%220%22,left:%220%22,height:%22100%25%22,width:%22100%25%22,backgroundColor:%22%23000%22,display:%22flex%22,justifyContent:%22center%22,alignItems:%22center%22,zIndex:%22100000%22}).appendTo(%22body%22)}setInterval(function(){e%26%26e.remove(),e=$(%22.current-frame-status%22).clone().removeClass(%22current-frame-status%22).appendTo(%22.overlay%22).css({fontSize:%223vw%22,color:%22%23fff%22})},1e3)}();