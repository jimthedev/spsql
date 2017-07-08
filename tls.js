const getDevelopmentCertificate = require("devcert-san").default;

const { log } = require('./logging');

async function makeTLS() {
  // Environment and cert setup
  let tls;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    try {
      tls = await getDevelopmentCertificate("spsql");
    } catch (e) {
      log.error(e);
    }
  } else {
    //tls = // load production ssl ...
    log.warn("TODO: prod ssl config");
  }
  return tls;
}

module.exports = {
  makeTLS
};
