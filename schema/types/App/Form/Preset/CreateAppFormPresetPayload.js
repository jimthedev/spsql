const AppFormPresetEntry = require('./AppFormPresetEntry');

const CreateAppFormPresetPayload = `
  type CreateAppFormPresetPayload {
    preset: AppFormPresetEntry
  }
`;

module.exports = () => [CreateAppFormPresetPayload, AppFormPresetEntry];
