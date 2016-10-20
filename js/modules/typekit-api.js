var baseAPIUrl = 'https://cctypekit-relstage.adobe.io/v1/'; //TODO: change to prod endpoint before deployment. Temporary stage endpoint now, because WebSDK staging endpoint is loaded currently to point to staging URL of IMS
var familiesEndpoint = baseAPIUrl + 'families';
var filtersEndpoint = baseAPIUrl + 'filters';
var previewsEndpoint = baseAPIUrl + 'previews';

var TypekitJS = function(accessToken, apiKey, browseMode) {
  var self = this;
  var networkHelper = new NetworkHelper(accessToken, apiKey);
  this.browseMode = browseMode || null;

  /**
   * @param searchParams Currently supports only following params - sort,
   * @param callback function with one argument - result. Result contains
   *    three fields - data, totalCount and error.
  */
  this.getFontFamilies = function(searchParams, callback) {
    setBrowseMode(searchParams);

    networkHelper.get(familiesEndpoint, searchParams, null, function(result) {
      processResult(result, function(parsedResult) {
        parsedResult.totalCount = Number(result.headers['total-count']);
        delete result['headers'];
        callback(parsedResult);
      }, false);
    });
  }

  /**
   * Get all font filters
   * @param callback function with one argument - result. Result contains
   *    two fields - data and error.
  */
  this.getFilters = function(params, callback) {
    params = params || {};
    setBrowseMode(params);
    networkHelper.get(filtersEndpoint, params, null, function(result) {
      processResult(result, callback);
    });
  }

  /**
   *
  */
  this.getPreviews = function(params, callback) {
    params = params || {};
    if (params.hasOwnProperty('browse_mode') && params.browse_mode === 'japanese') {
      params.language = 'ja';
    }
    setBrowseMode(params);
    networkHelper.get(previewsEndpoint, params, null, function(result){
      processResult(result, callback);
    });
  }

  /**
   * Gets meta data of a font family, identified by given slug
  */
  this.getFontFamilySlug = function(slug, callback) {
    networkHelper.get(familiesEndpoint + '/' + slug, null, null, function(result) {
      processResult(result, callback);
    });
  }

  // PRIVATE
  function processResult (result, callback, deleteHeaders) {
    if (result.data) {
      result.data = JSON.parse(result.data);
      if (result.headers && deleteHeaders !== false) {
        delete result['headers'];
      }
    }
    callback(result);
  }

  function setBrowseMode(params) {
    if (self.browseMode && !params.hasOwnProperty('browse_mode')) {
      params.browse_mode = self.browseMode;
    }
  }
}

var NetworkHelper = function(accessToken, apiKey) {
  var self = this;
  this.accessToken = accessToken;
  this.apiKey = apiKey;

  this.get = function(url, urlParams, requestHeaders, callback) {
    executeHTTPRequest('GET', url, urlParams, null, requestHeaders, callback);
  }

  this.post = function(url, urlParams, body, requestHeaders, callback) {
    executeHTTPRequest('POST', url, urlParams, body, requestHeaders, callback);
  }

  // PRIVATE Methods
  var executeHTTPRequest = function(requestType, url, urlParams, body, requestHeaders, callback) {
    if (urlParams) {
      url += '?' + createURLParamString(urlParams);
    }

    var contentType = null;
    if (requestType == 'POST' || requestType == 'PUT') {
      contentType = 'application/json';
    }

    var xhr = new XMLHttpRequest();
    xhr.open(requestType, url, true);

    if (self.accessToken) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + self.accessToken);
    }
    if (self.apiKey) {
      xhr.setRequestHeader('x-api-key', self.apiKey);
    }
    if (contentType) {
      req.setRequestHeader('Content-type', contentType);
    }

    if (requestHeaders) {
      // set additional request headers
      for (var headerName in requestHeaders) {
        xhr.setRequestHeader(headerName, requestHeaders[headerName]);
      }
    }

    xhr.onreadystatechange = function() {
      handleHttpRequestStateChange(xhr, callback);
    };

    xhr.send(body);
  }

  var handleHttpRequestStateChange = function(xhr, callback) {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        var headers = htmlResponseHeaderStringToObject(xhr.getAllResponseHeaders());
        callback({
          data: xhr.responseText,
          headers: headers,
          error: null
        });
      }
      else {
        callback({
          data: null,
          headers: null,
          error: {
            code: xhr.status,
            message: xhr.responseText
          }
        });
      }
    }
  }

  var createURLParamString = function(paramsObj) {
    var result = '';

    for (var key in paramsObj) {
      if (!paramsObj[key]) {
        continue;
      }
      var keyValue = encodeURIComponent(key) + '=' + encodeURIComponent(paramsObj[key])

      if (result !== '') {
        result += '&';
      }

      result += keyValue;
    }

    return result;
  }

  var htmlResponseHeaderStringToObject = function(headerString) {
    // headers are separated by new line. Each header key-value pair is
    // separated by ':'
    var headerKeyValues = headerString.split(/[\n\r]/);
    var result = {};
    headerKeyValues.forEach(function(keyValue) {
      var index = keyValue.indexOf(':');
      var key = keyValue.slice(0, index).trim();
      var value = keyValue.slice(index + 1).trim();
      if (key.length > 0) {
        result[key] = value;
      }
    });

    return result;
  }
};

module.exports = {
  api: TypekitJS
};
