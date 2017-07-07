const mutations = {
  addPerson: () => {
    return {
      id: "bozo",
      name: "yozo"
    };
  },
  createAppFormPreset: (
    obj,
    { input: { appId, formId, presetId, data } },
    { formPresetsService }
  ) => {
    return formPresetsService
      .post(`/apps/${appId}/forms/${formId}/presets/${presetId}`, data)
      .then(resp => {
        return {
          preset: {
            data,
            id: presetId
          }
        };
      });
  }
};

module.exports = mutations;
