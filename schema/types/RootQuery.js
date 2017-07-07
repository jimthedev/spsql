const Person = require("./Person/Person.schema");
const GraphQLMetadata = require("./GraphQLMetadata/GraphQLMetadata.schema");
const Identity = require("./Identity/IdentityEntry");
const AppEntry = require("./App/AppEntry");

const RootQuery = `
  type RootQuery {

    # A customer facing application
    app(id: String!): [AppEntry]

    # Metadata about graphql
    graphiql: GraphQLMetadata

    # The currently logged user
    me: Identity

    person(id: Int!): Person
    personByName(name: String!): Person
  }
`;

module.exports = () => [RootQuery, GraphQLMetadata, Person, Identity, AppEntry];
