var app = require('./angular-app');
var context = require('./demo-app-context');
var utils = require('./utils');
var auth = require('./auth');
var typekit = require('./typekit-api');
var FREE_TIER_IDENTIFIER = 'tier_0';

app.controller('FontVariationsCtrl', [ '$scope', '$http', '$location', '$routeParams', 'fontService',
  function($scope, $http, $location, $routeParams, fontService) {
    $scope.gotoFontList = function() {
      $location.path('/font_list');
    }

    var typekitAPI = new typekit.api(auth.getAccessToken(), context.getClientID());

    window.addEventListener('message', function(event){
      if (event.data.hasOwnProperty('type') && event.data.type === 'close-popups') {
        $scope.$apply(function(){
          if ($scope.showSampleTexts === true) {
            $scope.setShowSampleTexts(false);
          }
        });
      }
    });

    window.addEventListener('message', function(event) {
      if (event.data.hasOwnProperty('type') && event.data.type === 'IMSReady') {
        // this will be called if variations page is refreshed
        $scope.$apply(function() {
          typekitAPI = new typekit.api(auth.getAccessToken(), context.getClientID());
          // call loadFontVariations only after IMS is ready and API object is created
          loadFontVariations();
        });
      }
    });

    $scope.showSampleTexts = false;
    $scope.fonts = [];
    $scope.fontFamily = fontService.getCurrentFontFamily();
    $scope.sampleTexts = [ 'Enter your own text' ];
    $scope.selectedSampleTextIndex = 1;

    $scope.currentSampleText = $scope.sampleTexts[$scope.selectedSampleTextIndex];

    var collection = $routeParams.hasOwnProperty('collection') ? $routeParams.collection :
      context.getCurrentCollection();

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

    typekitAPI.getPreviews(
      {
        type: 'details',
        browse_mode: context.isJapaneseBrowseMode() ? 'japanese' : 'default'
      },
      function(result) {
        if (result.error) {
          var msg = 'Error getting preview samples';
          utils.handleError([ msg, result ], msg, result.error);
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

    function getSyncFont(font) {
      if (font.hasOwnProperty('font') && font.font.hasOwnProperty('sync')) {
        return font.font.sync;
      }
      return null;
    }

    function isAvailableForSync(font) {
      var syncFont = getSyncFont(font);
      if (!syncFont) {
        return false;
      }
      if (auth.isSignedInUser()) {
        return syncFont.required_action.length === 0;
      }
      else {
        return syncFont.library_availability.trial || syncFont.library_availability.full;
      }
    }

    function isFontSelectedForSync(font) {
      var syncFont = getSyncFont(font);
      if (!syncFont) {
        return false;
      }
      return syncFont.is_selected;
    }

    function isAvailableForPurchase(font) {
      return font.hasOwnProperty("marketplace")
        && !font.marketplace.is_purchased_by_user
        && font.marketplace.price_tier != FREE_TIER_IDENTIFIER
        && font.marketplace.purchasable
        && !isAvailableForSync(font)
        && !isFontSelectedForSync(font)
    }

    $scope.canDisplayPurchaseBtn = function(font) {
      return isAvailableForPurchase(font);
    }

    $scope.purchaseFont = function(font) {
      if (!auth.isSignedInUser()) {
        auth.signIn();
        return;
      }

      typekitAPI.aquireFontVariations([ font.font.web.font_id ],
      function(result) {
        if (result.error) {
          var msg = 'Error getting purchase URL';
          utils.handleError([ msg, result ], msg, result.error);
          return;
        }
        // open jump_url
        // window.location.href = result.data.jump_url;
        window.open(result.data.jump_url, 'tkBuyMarketplaceWindow');
      });
    }

    var loadFontVariations = function() {
      typekitAPI.getFontFamilySlug($scope.fontFamily.slug, {
        include: [ collection ],
        include_marketplace_data: true,
      }, processFontVariationsResponse);
    }

    function processFontVariationsResponse(result) {
      if (result.error) {
        var msg = 'Error getting font variations';
        utils.handleError([ msg, result ], msg, result.error);
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
              variations:[ font.font.web.fvd ],
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
    }

    if (auth.isReady()) {
      loadFontVariations();
    }
  }
]);

app.directive('tkFocus', function() {
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
