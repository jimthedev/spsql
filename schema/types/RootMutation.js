const CreateAppFormPresetInput = require("./App/Form/Preset/CreateAppFormPresetInput");
const CreateAppFormPresetPayload = require("./App/Form/Preset/CreateAppFormPresetPayload");

const RootMutation = `
  type RootMutation {
    # A mutation to add a new channel to the list of channels
    addPerson(name: String!): Person
    createAppFormPreset(input: CreateAppFormPresetInput): CreateAppFormPresetPayload
  }
`;

module.exports = () => [
  RootMutation,
  CreateAppFormPresetInput,
  CreateAppFormPresetPayload
];
