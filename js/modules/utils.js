var utils = {
  handleError: function(dataToLogToConsole, errorMessage) {
    console.log(dataToLogToConsole || errorMessage);
    if (errorMessage) {
      alert(errorMessage);
    }
  }
}

module.exports = utils;
