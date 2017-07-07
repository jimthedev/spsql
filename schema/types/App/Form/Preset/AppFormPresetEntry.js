const AppFormPresetEntry = `

  # A state of a form saved by a user
  #
  # A preset is really just a label plus the
  # state of a form serialized as json.
  type AppFormPresetEntry {
    id: ID
    name: String
    data: String
  }
`;

module.exports = () => [
  AppFormPresetEntry
]
