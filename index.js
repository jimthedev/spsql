const https = require("https");
const { microGraphiql, microGraphql } = require("graphql-server-micro");
const { send, run } = require("micro");
const micro = require("micro").default;
const { get, post, router } = require("microrouter");
const getDevelopmentCertificate = require("devcert-san").default;
const querystring = require("querystring");
const axios = require("axios");
var { buildSchema } = require("graphql");

// logging
const logdown = require('logdown')
const graphqlCatchAll = logdown('graphql.catchall')

// performance
var OpticsAgent = require('optics-agent');

async function startServer() {

  // Environment and cert setup
  let ssl;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    try {
      ssl = await getDevelopmentCertificate("spsql");
    } catch (e) {
      console.error(e);
    }
  } else {
    //ssl = // load production ssl ...
    console.log("TODO: prod ssl config");
  }

  // Construct a schema, using GraphQL schema language
  var schema = buildSchema(`
    schema {
      query: RootQuery
      mutation: RootMutation
    }
    # Find information in our domain model.
    # [Learn more](http://graphql.org/learn/queries/)
    type RootQuery {

      # Hello, world!
      hello: String

      # An SPS Application
      app(
        id: String!,
      ): [AppEntry]

      # Information about the currently logged in user
      me: CurrentIdentity

      # Meta information about a graphql
      graphiql: GraphQLMetadata
    }

    type RootMutation {
      createAppFormPreset (input: CreateAppFormPresetInput): CreateAppFormPresetPayload
    }

    type GraphQLMetadata {
      NODE_ENV: String
      accessToken: String
    }

    type CurrentIdentity {
      firstName: String
      email: String
    }
    type AppEntry {
      id: ID
      name: String
      slug: String
      form (
        id: ID!
      ): FormEntry
    }
    type FormEntry {
      id: ID
      name: String
      slug: String
      preset (
        id: ID
        name: String
      ): AppFormPresetEntry
    }

    # A state of a form saved by a user
    #
    # A preset is really just a label plus the
    # state of a form serialized as json.
    type AppFormPresetEntry {
      id: ID
      name: String
      data: String
    }

    # Save the state of a form as json with a label given by the user
    input CreateAppFormPresetInput {
      # The app where the form lives
      appId: String
      # Which form in the app
      formId: String
      # The plaintext name of the preset, chosen by the user
      presetId: String
      # The state of the form as json
      data: String
    }

    type CreateAppFormPresetPayload {
      preset: AppFormPresetEntry
    }


  `);

  // The root provides a resolver function for each API endpoint
  var root = {
    createAppFormPreset: ({input: {appId, formId, presetId, data}}, {formPresetsService}, context) => {
        console.log(appId, formId, presetId)
        return formPresetsService.post(`/apps/${appId}/forms/${formId}/presets/${presetId}`, data)
          .then((resp) => {
            return {
              preset: {
                data
              }
            }
          })
    },
    me: (root, { accessToken, identityService }, context) => {
      return identityService
        .get(`/users/me?access_token=${accessToken}`)
        .then(response => {
          const { first_name: firstName, email } = response.data;
          return ({
            firstName,
            email
          });
        })
        .catch(e => console.error(e));
    },
    graphiql: (root, {accessToken}, context) => {
      return {
        accessToken,
        NODE_ENV: process.env.NODE_ENV || "development"
      }
    },
    hello: () => {
      return new Promise(resolve => {
        resolve("Hello world!");
      });
    },
    ok: () => {
      return "Yeppers";
    },
    app: ({id: appId}, { formPresetsService }, context) => {
      return [{
        id: appId,
        slug: "assortment",
        name: "Assortment",
        form: ({id: formId}, { accessToken, formPresetsService }, context) => {
          return {
            id: formId,
            preset: ({id: presetId}, args, context) => {
              return formPresetsService.get(`/apps/${appId}/forms/${formId}/presets/${presetId}`)
                .then((resp) => {
                  return {
                    id: presetId,
                    data: JSON.stringify(resp.data)
                  }
                })
            }
          }
        }
      }]
    }
  };

  const getAccessTokenFromRequest = req => {
    const qs = req.url.substring(req.url.indexOf("?") + 1);
    return querystring.parse(qs).access_token;
  };

  getGraphqlHandler = req => {
    const accessToken = getAccessTokenFromRequest(req);

    const identityService = axios.create({
      baseURL: "http://localhost:8080/identity/",
      timeout: 3000
    });

    const formPresetsService = axios.create({
      baseURL: "https://p5gzm7t2xi.execute-api.us-east-1.amazonaws.com/v0_1_1/",
      timeout: 3000,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      }
    });

    return microGraphql({
      schema,
      rootValue: root,
      formatError: (error) => {
        graphqlCatchAll.error(error);
        return {
          message: 'An error occurred and logged in graphql.catchall'
        }
      },
      context: {
        accessToken,
        identityService,
        formPresetsService
      }
    });
  };

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
      get("/yo", (req, res) => {
        return send(res, 200, "");
      }),
      (req, res) => {
        return send(res, 404, "not found");
      }
    )
  );

  const { PORT = 8100 } = process.env;

  console.log("Running on port", PORT);
  server.listen(PORT);
}

startServer().catch(e => console.error(e));
