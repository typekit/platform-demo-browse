var angular = require('angular');
var context = require('./demo-app-context');
require('angular-route');

var app = angular.module('demoApp', ['ngRoute']);

// Set routes
app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/font_list', {
    templateUrl: 'partials/font_list.html',
    controller: 'MainCtrl'
  })
  .when('/font_variations', {
    templateUrl: 'partials/font_variations.html',
    controller: 'FontVariationsCtrl'
  })
  .otherwise({
    redirectTo: '/font_list'
  });
}]);

app.service('fontService', function(){
  var currentFontFamily = null;
  var typekitAPI = null ;

  return {
    getCurrentFontFamily: function() {
      return currentFontFamily;
    },
    setCurrentFontFamily: function(fontFamily) {
      currentFontFamily = fontFamily;
    },
    getTypekitAPI: function() {
      return typekitAPI;
    },
    setTypekitAPI: function(api) {
      typekitAPI = api;
    },
    handleError: function(errorMessage, dataToLogToConsole) {
      console.log(dataToLogToConsole || errorMessage);
      if (errorMessage) {
        alert(errorMessage);
      }
    }
  }
});

module.exports = app;
