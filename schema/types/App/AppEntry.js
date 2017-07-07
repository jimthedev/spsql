const AppFormEntry = require('./Form/AppFormEntry');

const AppEntry = `
  # An entry that describes a single application
  type AppEntry {
    id: ID
    name: String
    slug: String
    form (
      id: ID!
    ): AppFormEntry
  }
`;

module.exports = () => [AppEntry, AppFormEntry];
