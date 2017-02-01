var utils = {
  handleError: function(dataToLogToConsole, errorMessage, errorObj) {
    console.log(dataToLogToConsole || errorMessage);
    if (errorMessage) {
      var alertMessage = errorMessage;
      // if error object is passed, then append error message in the error object
      if (errorObj && errorObj.hasOwnProperty('message')) {
        // message returned from the server is actually stringified json. Try to parse it as json
        // It contains code and message
        var errorJSON = JSON.parse(errorObj.message);
        if (errorJSON.hasOwnProperty('message')) {
          alertMessage += ". " + errorJSON.message;
        }
        else {
          alertMessage += ". " + errorObj.message;
        }
      }
      alert(alertMessage);
    }
  }
}

module.exports = utils;
