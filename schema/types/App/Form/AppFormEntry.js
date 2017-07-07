const AppFormPresetEntry = require('./Preset/AppFormPresetEntry');

const AppFormEntry = `
  type AppFormEntry {
    id: ID
    name: String
    slug: String
    preset (
      id: ID
      name: String
    ): AppFormPresetEntry
  }
`;

module.exports = () => [AppFormEntry, AppFormPresetEntry];
