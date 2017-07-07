require("dotenv-safe").load();
const https = require("https");
const { microGraphiql, microGraphql } = require("graphql-server-micro");
const { send, run } = require("micro");
const micro = require("micro").default;
const { get, post, router } = require("microrouter");
const getDevelopmentCertificate = require("devcert-san").default;
const querystring = require("querystring");
const axios = require("axios");

const schema = require("./schema/index");
const { formatError, log } = require("./logging");

async function startServer() {
  // Environment and cert setup
  let ssl;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    try {
      ssl = await getDevelopmentCertificate("spsql");
    } catch (e) {
      log.error(e);
    }
  } else {
    //ssl = // load production ssl ...
    log.warn("TODO: prod ssl config");
  }

  /*
   * Access tokens are passed in via the query string
   */
  const getAccessTokenFromRequest = req => {
    const qs = req.url.substring(req.url.indexOf("?") + 1);
    return querystring.parse(qs).access_token;
  };

  /*
   * Set up an instance of graphql do things like register
   * variables or services that need to be on the context,
   * register the schema, error handling, etc.
   */
  const getGraphqlHandler = req => {
    const accessToken = getAccessTokenFromRequest(req);

    const identityService = axios.create({
      baseURL: process.env.IDENTITY_SERVICE_URL,
      timeout: process.env.IDENTITY_SERVICE_TIMEOUT
    });

    const formPresetsService = axios.create({
      baseURL: process.env.FORM_PRESETS_SERVICE_URL,
      timeout: process.env.FORM_PRESETS_SERVICE_TIMEOUT,
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json"
      }
    });

    return microGraphql({
      schema,
      formatError,
      context: {
        accessToken,
        identityService,
        formPresetsService
      }
    });
  };

  /*
   * Set up an instance of graphiql
   */
  const getGraphiqlTokenHandler = req => {
    const accessToken = getAccessTokenFromRequest(req);
    return microGraphiql({
      endpointURL: "/graphql",
      passHeader: `'access_token': '${accessToken}'`
    });
  };

  const getGraphiqlHandler = (req, res) => {
    return getGraphiqlTokenHandler(req)(req, res);
  };

  const microHttps = fn =>
    https.createServer(ssl, (req, res) => run(req, res, fn));

  const server = microHttps(
    router(
      get("/graphql", (req, res) => {
        return getGraphqlHandler(req)(req, res);
      }),
      post("/graphql", (req, res) => {
        return getGraphqlHandler(req)(req, res);
      }),
      get("/", (req, res) => {
        return getGraphiqlHandler(req, res);
      }),
      get("/noop", (req, res) => {
        return send(res, 200, "");
      }),
      (req, res) => {
        return send(res, 404, "not found");
      }
    )
  );

  const { PORT = 8100 } = process.env;

  log.log("Running on port", PORT);
  server.listen(PORT);
}

startServer().catch(e => {
  log.error("UNCAUGHT ERROR: ", e);
});
