var utils = require('./utils');
var context = require('./demo-app-context');
var userSignedIn = false;
var accessToken = null;
var ready = false; // is auth module ready - true only when we get response from AdobeCreativeSDK.getAuthStatus?

var auth = {
  signIn: function() {
    AdobeCreativeSDK.login();
  },

  signOut: function() {
    AdobeCreativeSDK.logout();
    userSignedIn = false;
    accessToken = null;
  },

  signUp: function() {
    adobeIMS.signUp();
  },

  getAccessToken: function() {
    if (!accessToken && typeof adobeIMS !== 'undefined') {
      return adobeIMS.getAccessToken();
    }
    return accessToken;
  },

  isSignedInUser: function() {
    return userSignedIn;
  },

  isReady: function() {
    return ready;
  }
};

// Initialize the Adobe WebSDK
AdobeCreativeSDK.init({
  clientID: context.getClientID(),
  scope: 'openid,tk_platform,tk_platform_mp',
  onError: function(error) {
    // Handle any global or config errors here
    if (error.type === AdobeCreativeSDK.ErrorTypes.AUTHENTICATION) {
      // Note: this error will occur when you try and launch a component without checking if the user has authorized your app. From here, you can trigger AdobeCreativeSDK.loginWithRedirect().
      auth.signIn();
    } else if (error.type === AdobeCreativeSDK.ErrorTypes.GLOBAL_CONFIGURATION) {
      utils.handleError('Error initializing AdobeCreativeSDK. Please check your configuration');
    } else if (error.type === AdobeCreativeSDK.ErrorTypes.SERVER_ERROR) {
      utils.handleError('Oops, something went wrong. Error initializing AdobeCreativeSDK');
    }
  }
});

// check if user is logged-in by getting auth status
AdobeCreativeSDK.getAuthStatus(function(result) {
  var userName = null;

  ready = true;

  if (result.isAuthorized) {
    var userProfile = adobeIMS.getUserProfile();
    var userName = null;
    if (userProfile != null) {
      userName = userProfile.name;
    }
    accessToken = result.accessToken;
    userSignedIn = true;
  }

  window.postMessage({
    type: 'IMSReady',
    userName: userName,
    isSignedUser: userSignedIn
  }, "*");
});

module.exports = auth;
