const AppFormPresetEntry = require("./AppFormPresetEntry");

const CreateAppFormPresetInput = `
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
`;

module.exports = () => [CreateAppFormPresetInput, AppFormPresetEntry];
