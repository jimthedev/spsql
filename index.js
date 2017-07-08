require("dotenv-safe").load();
const https = require("https");
const { microGraphiql, microGraphql } = require("graphql-server-micro");
const { send, run } = require("micro");
const micro = require("micro").default;
const { get, post, router } = require("microrouter");
const querystring = require("querystring");
const axios = require("axios");

const schema = require("./schema/index");
const { makeTLS }  = require("./tls");
const { formatError, log } = require("./logging");

async function startServer() {

  // Get a tls config
  const tls = await makeTLS();

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

  /*
   * Map handler to handler factory
   */
  const getGraphiqlHandler = (req, res) => {
    return getGraphiqlTokenHandler(req)(req, res);
  };

  /*
   * Create an https server, map to micro
   */
  const microHttps = fn =>
    https.createServer(tls, (req, res) => run(req, res, fn));

  /*
   * Define the micro routes and route handlers
   */
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
      // Noop is for a bug in router
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

  // Actually start the server
  server.listen(PORT);
}

startServer().catch(e => {
  log.error("UNCAUGHT ERROR: ", e);
});
