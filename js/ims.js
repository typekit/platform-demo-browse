(function() {
  "use strict"

  window.adobeid = {
    client_id: 'TypekitSwaggerUI',
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
    scope: 'tk_platform,tk_platform_mp,tk_platform_sync',
    locale: 'en_US'
  };
})();
