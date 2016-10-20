var app = require('./angular-app');
var context = require('./demo-app-context');
var utils = require('./utils');

app.controller('FontVariationsCtrl', ['$scope', '$http', '$location', 'fontService',
  function($scope, $http, $location, fontService){
    $scope.gotoFontList = function() {
      $location.path('/font_list');
    }

    window.addEventListener('message', function(event){
      if (event.data.hasOwnProperty('type') && event.data.type === 'close-popups') {
        $scope.$apply(function(){
          if ($scope.showSampleTexts === true) {
            $scope.setShowSampleTexts(false);
          }
        });
      }
    });

    $scope.showSampleTexts = false;
    $scope.fonts = [];
    $scope.fontFamily = fontService.getCurrentFontFamily();
    $scope.sampleTexts = [ 'Enter your own text' ];
    $scope.selectedSampleTextIndex = 1;

    $scope.currentSampleText = $scope.sampleTexts[$scope.selectedSampleTextIndex];

    if (!$scope.fontFamily) {
      // check in the local storage
      if (localStorage.fontFamily) {
        $scope.fontFamily = JSON.parse(localStorage.fontFamily);
      }
      else {
        $scope.gotoFontList();
        return;
      }
    }
    var typekitAPI = fontService.getTypekitAPI();

    typekitAPI.getPreviews(
      {
        type: 'details',
        browse_mode: context.isJapaneseBrowseMode() ? 'japanese' : 'default'
      },
      function(result) {
        if (result.error) {
          var msg = 'Error getting preview samples';
          utils.handleError([msg, result], msg);
          return;
        }
        $scope.sampleTexts = $scope.sampleTexts.slice(0,1).concat(result.data);
        $scope.currentSampleText = $scope.sampleTexts[$scope.selectedSampleTextIndex];
      }
    );

    $scope.getVariantStyle = function(fvd) {
      var fvd = fvd;
      if ( fvd.charAt(0) == 'i') {
        return 'italic';
      } else if ( fvd.charAt(0) == 'n') {
        return 'normal';
      }
    };

    $scope.getVariantWeight = function(fvd) {
      var fvd = fvd;
      return fvd.charAt(1)+'00';
    };

    $scope.getFoundryName = function() {
      if ($scope.fontFamily.foundry) {
        return $scope.fontFamily.foundry.name;
      }
      return '';
    }

    $scope.setShowSampleTexts = function(show) {
      $scope.showSampleTexts = show;
    }

    $scope.toggleShowSampleTexts = function($event) {
      $scope.showSampleTexts = !$scope.showSampleTexts;
      $event.stopPropagation();
    }

    $scope.selectSampleText = function(index) {
      $scope.selectedSampleTextIndex = index;
      if (index > 0) {
        $scope.currentSampleText = $scope.sampleTexts[index];
      }
    }

    var loadFontVariations = function() {
      typekitAPI.getFontFamilySlug($scope.fontFamily.slug, function(result){
        if (result.error) {
          var msg = 'Error getting font variations';
          utils.handleError([msg, result], msg);
          return;
        }

        var fonts = [];
        var fontFamilies = [];
        // filter only web fonts
        if (result.data.fonts) {
          result.data.fonts.forEach(function(font) {
            if (font.family.hasOwnProperty('web_id')){
              fonts.push(font);
              font._cssFontFamily = font.family.web_id + '-' + font.font.web.fvd;
                fontFamilies.push({
                  id: font.family.web_id,
                  variations:[font.font.web.fvd],
                });
            }
          });
        }

        if (fontFamilies.length > 0) {
          TypekitPreview.load(fontFamilies);
        }

        $scope.$apply(function(){
          $scope.fonts = fonts;
        });
      });
    }

    loadFontVariations();
}]);

app.directive('tkFocus', function(){
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      scope.$watch('selectedSampleTextIndex', function(newValue, oldValue) {
        if (newValue === 0) {
          elm[0].focus();
          elm[0].setSelectionRange(0, elm[0].value.length);
        }
      });
    }
  };
});

// nothing to export here
