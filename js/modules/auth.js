var utils = require('./utils');
var context = require('./demo-app-context');
var userSignedIn = false;
var accessToken = null;

// Initialize the Adobe WebSDK
AdobeCreativeSDK.init({
  clientID: context.getClientID(),
  scope: 'openid,tk_platform,tk_platform_mp,tk_platform_sync',
  onError: function(error) {
    // Handle any global or config errors here
    if (error.type === AdobeCreativeSDK.ErrorTypes.AUTHENTICATION) {
      // Note: this error will occur when you try and launch a component without checking if the user has authorized your app. From here, you can trigger AdobeCreativeSDK.loginWithRedirect().
      AdobeCreativeSDK.login();
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

var auth = {
  signIn: function() {
    // Currently 0.3 version of WebSDK is deployed in production, which has function AdobeCreativeSDK.loginWithRedirect. This is renamed to AdobeCreativeSDK.login in the new WebSDK version, which is not deployed in production yet. So we will first check if AdobeCreativeSDK.login exists.
    if (typeof AdobeCreativeSDK.login === 'function') {
      AdobeCreativeSDK.login();
    } else {
      AdobeCreativeSDK.loginWithRedirect();
    }
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
    return accessToken;
  },

  isSignedInUser: function() {
    return userSignedIn;
  }
};

module.exports = auth;
