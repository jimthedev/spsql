const GraphQLMetadata = `
  type GraphQLMetadata {
    NODE_ENV: String
    accessToken: String
  }
`;

module.exports = () => [GraphQLMetadata];
