(function() {
  "use strict"

  window.adobeid = {
    client_id: 'TypeKit2',
    onReady: function() {
      try {
        var userProfile = adobeIMS.getUserProfile();
        var userName = null;
        if (userProfile != null) {
          userName = userProfile.name;
        }

        window.postMessage({
          type: 'IMSReady',
          userName: userName,
          isSignedUser: adobeIMS.isSignedInUser()
        }, "*");

      } catch (ex) {
        // in its current implementation, imslib.js will silently dismiss errors
        console.error('onReady', ex);
        throw ex;
      }
    },
    uses_debug_mode: true,
    // OTHER FREQUENTLY USED OPTIONS:
    scope: 'creative_cloud,sao.typekit,openid,sao.cce_private,AdobeID,gnav,additional_info.roles', //-- default profile, plus date of birth
    locale: 'en_US',
    ssoLoginUrl: 'http://localhost:8080?handle_sso_login',
    ssoLogoutUrl: 'http://localhost:8080?handle_sso_logout',
  };
})();
