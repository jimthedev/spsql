// logging
const shortid = require('shortid');
const logdown = require("logdown");
const log = logdown("catchall");

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

const isDev = () => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    return true;
  }
}

const formatError = error => {
  const errorTrackingId = shortid.generate();
  error.errorTrackingId = errorTrackingId;

  if(isDev() || error.message.includes('Cannot query field')) {
    // Log errors to server console
    log.error(error);
    return error;
  }

  log.error(error);
  return {
    // TODO: Add error handling prod or don't dump to console
    message: `An unexpected error occurred and was logged. Please refer to this issue with error tracking id ${errorTrackingId}`,
    errorTrackingId
  };
}

module.exports = {
  formatError,
  log
}
