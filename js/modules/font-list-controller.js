var app = require('./angular-app');
var auth = require('./auth');
var typekit = require('./typekit-api');
var context = require('./demo-app-context');
var utils = require('./utils');

app.controller('MainCtrl', ['$scope', '$http', '$location', 'fontService',
  function($scope, $http, $location, fontService) {

    $scope.imsReady = $scope.imsReady || false;
    $scope.headerLoaded = false;
    $scope.data = [];
    $scope.filters = {};
    $scope.total = 0;
    $scope.userSignedIn = false;
    $scope.sort = 'featured_rank';
    $scope.currentPage = context.fontListPageNum;
    var perPage = context.fontListCardsPerPage;
    var filterArray = [];
    var japaneseMode = context.isJapaneseBrowseMode();
    var typekitAPI = new typekit.api(auth.getAccessToken(), context.getClientID());

    var restoreScrollPos = true;

    fontService.setTypekitAPI(typekitAPI);

    window.addEventListener('message', function(event) {
      if (event.data.hasOwnProperty('type') && event.data.type === 'IMSReady') {
        $scope.$apply(function() {
          $scope.imsReady = true;
          $scope.userSignedIn = !!auth.isSignedInUser();
          $scope.userName = event.data.userName || '';
        });
      }
    });

    $scope.signIn = function() {
      auth.signIn();
    }

    $scope.signOut = function() {
      auth.signOut();
    }

    $scope.signUp = function() {
      auth.signUp();
    }

    $scope.canShowWaitingIMS = function() {
      if (!$scope.headerLoaded) {
        return false;
      }
      return !$scope.imsReady;
    }

    $scope.onHeaderLoaded = function() {
      $scope.headerLoaded = true;
    }

    $scope.dashCase = function (str) {
      var dashCaseString = str.replace(/\s+/g, '-').toLowerCase();
      return dashCaseString;
    };

    $scope.getVariantStyle = function (fvd) {
      var fvd = fvd;
      if ( fvd.charAt(0) == 'i') {
        return 'italic';
      } else if ( fvd.charAt(0) == 'n') {
        return 'normal';
      }
    };

    $scope.getVariantWeight = function (fvd) {
      var fvd = fvd;
      return fvd.charAt(1)+'00';
    };

    $scope.changeSort = function(sort) {
      setCurrentPage(1);
      resetScrollPos();
      $scope.sort = sort;
      loadFontFamilies();
    };

    $scope.onShowFontVariations = function(fontFamily) {
      context.captureFontListScrollPos();
      fontService.setCurrentFontFamily(fontFamily);
      localStorage.fontFamily = JSON.stringify(fontFamily);
      $location.path('/font_variations');
    }

    $scope.filterChange = function(key, val, filter) {
      setCurrentPage(1);
      resetScrollPos();
      filterArray = [];

      if ( filter.type == 'select' ) {
        angular.forEach($scope.filters, function(categoryElement) {
          if (categoryElement['type'] == 'group') {
            angular.forEach(categoryElement.filters, function(filterElement) {
              if (filterElement.name == filter.name) {
                angular.forEach(filterElement.values, function(valueElement) {
                  valueElement['setting'] = false;
                  if (valueElement.key == key) {
                    valueElement['setting'] = val;
                  }
                });
              }
            });
          } else {
            if (categoryElement.name == filter.name) {
              angular.forEach(categoryElement.values, function(valueElement) {
                valueElement['setting'] = false;
                if (valueElement.key == key) {
                  valueElement['setting'] = val;
                }
              });
            }
          }
        });
      }

      angular.forEach($scope.filters, function(categoryElement) {
        if (categoryElement['type'] != 'group') {
          angular.forEach(categoryElement.values, function(valueElement) {
            if (valueElement['setting']) {
              filterArray.push(valueElement['key']);
            }
          });
        } else {
          angular.forEach(categoryElement.filters, function(filterElement) {
            angular.forEach(filterElement.values, function(valueElement) {
              if (valueElement['setting']) {
                filterArray.push(valueElement['key']);
              }
            });
          });
        }
      });

      loadFontFamilies();
    };

    $scope.loadPrev = function() {
      var previousPage = $scope.currentPage - 1;
      resetScrollPos();
      loadFontFamilies(previousPage, function() {
        $scope.$apply(function() {
          setCurrentPage(previousPage);
        });
      });
    };

    $scope.loadNext = function() {
      var nextPage = $scope.currentPage + 1;
      resetScrollPos();
      loadFontFamilies(nextPage, function() {
        $scope.$apply(function() {
          setCurrentPage(nextPage);
        });
      });
    };

    $scope.loadMore = function() {
      $scope.loadNext();
    };

    $scope.isJapaneseMode = function() {
      return japaneseMode;
    }

    $scope.setJapaneseMode = function(toJapanese) {
      if (context.isJapaneseBrowseMode() == toJapanese) {
        return;
      }
      context.setJapaneseMode(toJapanese);
      updateSampleText();
      setCurrentPage(1);
      resetScrollPos();
      loadFilters();
      loadFontFamilies();
    }

    $scope.onCardLoaded = function(index) {
      if (index === $scope.data.length - 1 && restoreScrollPos) {
        // last card had been loaded. Restore the scroll poistion
        context.restoreFontListScrollPos();
        restoreScrollPos = false;
      }
      return '';
    }

    function updateSampleText() {
      typekitAPI.getPreviews(
        {
          browse_mode: context.isJapaneseBrowseMode() ? 'japanese' : 'default'
        },
        function(result) {
          if (result.error) {
            var msg = 'Error getting preview samples';
            utils.handleError([msg, result], msg);
            return;
          }
          if (result.data.length > 0) {
            $scope.sampleText = result.data[0];
          }
        }
      );
    }

    function loadFilters() {
      typekitAPI.getFilters({
          browse_mode: context.browseMode
        }, function(result) {
        if (result.error) {
          var msg = 'Error getting font filters';
          utils.handleError([msg, result], msg);
          return;
        }

        // got font filters
        var filterData = result.data;
        var tmpFilters = [];
        angular.forEach(filterData, function(categoryElement) {
          if (categoryElement['type'] != 'group') {
            angular.forEach(categoryElement.values, function(valueElement) {
              valueElement['setting'] = false;
            });
          }
          else {
            angular.forEach(categoryElement.filters, function(filterElement) {
              angular.forEach(filterElement.values, function(valueElement) {
                valueElement['setting'] = false;
              });
            });
          }
          tmpFilters.push(categoryElement);
        }
      );

        $scope.$apply(function() {
          $scope.filters = tmpFilters;
          japaneseMode = context.isJapaneseBrowseMode();
        });

      });
    }

    function loadFonts(data) {
      var fontFamilies = [];
      angular.forEach(data, function(family, key) {
        fontFamilies.push({
          'id': family.display_font.family.web_id,
          'variations':[family.display_font.font.web.fvd],
        });
      });
      TypekitPreview.load(fontFamilies);
    };

    function loadFontFamilies(pageNum, callback) {
      typekitAPI.getFontFamilies({
          sort: $scope.sort,
          page: pageNum || $scope.currentPage,
          filters: filterArray.toString(),
          per_page: perPage,
          include_all: false,
          browse_mode: context.browseMode
        },
        function(result) {
          if (result.error) {
            var msg = 'Error getting font families';
            console.log(msg, result.error);
            alert(msg);
            return;
          }
          $scope.$apply(function() {
            $scope.total = result.totalCount;
            $scope.pageTotal = Math.ceil($scope.total/perPage);
            $scope.data = result.data;
          });
          loadFonts(result.data);
          if (callback) {
            callback(result.data);
          }
        }
      );
    }

    function setCurrentPage(pageNum) {
      $scope.currentPage = context.fontListPageNum = pageNum;
    }

    function resetScrollPos() {
      context.lastFontListScrollPos = 0;
      restoreScrollPos = true;
    }

    TypekitPreview.setup({
      'auth_id': 'pda',
      'auth_token': '3bb2a6e53c9684ffdc9a9bf61f5b2a62850218b0182b3a8f955d7ad2db6640a2b2439afede07515db382594b4aa69c9b8dba6a119c3868ef68dce25289909f0c743dbd98406428d26379c38714661995041ce85ee2ed4368d0a2adb574268c56502fcc6dd561f73bd2',
      'default_subset': 'default',
    });

    loadFilters();
    loadFontFamilies();
    updateSampleText();
  }]

);

// nothing to export here
