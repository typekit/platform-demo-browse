require('./font-list-controller');
require('./variations-controller');

var fireClosePopupEvent = function() {
  window.postMessage({
    type: 'close-popups',
  }, "*");
}

document.body.addEventListener('click', function(e) {
  fireClosePopupEvent();
});

document.body.addEventListener('keyup', function(e) {
  fireClosePopupEvent();
});
