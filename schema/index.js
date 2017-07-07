const { makeExecutableSchema } = require('graphql-tools');

const RootQuery = require("./types/RootQuery");
const RootMutation = require("./types/RootMutation");

const resolvers = {
  RootQuery: require('./resolvers/queries'),
  RootMutation: require('./resolvers/mutations')
};

const SchemaRoot = `
  schema {
    query: RootQuery
    mutation: RootMutation
  }
`;

const schema = makeExecutableSchema({
  typeDefs: [SchemaRoot, RootQuery, RootMutation],
  resolvers,
});

module.exports = schema;
