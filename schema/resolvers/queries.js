/*
 * Transforms
 *
 * Transforms are useful for when taking flat fields
 * from an object and mapping them to an objects which actually
 * corresponds to the shape of a type.
 *
 * For example, a response might come back with:
 *   {
 *     name,
 *     email,
 *     avatar_image_id,
 *     avatar_image_url
 *   }
 *
 *  But we might actually want
 *  {
 *    name,
 *    email,
 *    avatarImage {
 *      id,
 *      url
 *    }
 *  }
 */
const t = {
  AvatarImage: (o) => {
    return {
      id: o.avatar_image_id,
      url: o.avatar_image_url,
      originId: o.origin_avatar_image_id
    }
  },
  Organization: (o) => {
    return {
      id: o.id,
      namespace: o.namespace,
      name: o.organization_name,
      website: o.organization_site
    }
  }
};

const queries = {
  app: (obj, {id: appId}, { formPresetsService }) => {
    return [{
      id: appId,
      slug: "assortment",
      name: "Assortment",
      form: ({id: formId}) => {
        return {
          id: formId,
          preset: ({id: presetId}) => {
            return formPresetsService.get(`/apps/${appId}/forms/${formId}/presets/${presetId}`)
              .then((resp) => {
                return {
                  id: presetId,
                  data: JSON.stringify(resp.data)
                }
              })
          }
        }
      }
    }]
  },
  graphiql: (obj, args, {accessToken}) => {
    return {
      accessToken,
      NODE_ENV: process.env.NODE_ENV || "development"
    }
  },
  me: (obj, args, { accessToken, identityService }) => {
    return identityService
      .get(`/users/me?access_token=${accessToken}`)
      .then(response => {
        const d = response.data;
        return ({
          id: d.id,

          firstName: d.first_name,
          lastName: d.last_name,

          city: d.city,
          state: d.state,
          country: d.country,

          bio: d.bio,
          jobTitle: d.job_title,

          organization: t.Organization(d),

          organizations: d.organizations.map(t.Organization),

          avatarImage: t.AvatarImage(d),
          roles: d.roles,

          email: d.email,
          phoneNumber: d.phone_number,
          twitterHandle: d.twitter_handle,
          linkedInUrl: d.linkedin_url,

          externallyManaged: d.externally_managed,
          userType: d.user_type,
          tokenType: d.token_type
        });
      })
  },
  person: (obj, args, {accessToken}) => {
    return {
      id: 'hey' + accessToken,
      name: 'jim'
    }
  },
  personByName: (obj, args, {accessToken}) => {
    return {
      id: 'hey by name',
      name: 'Jim by name'
    }
  }
}

module.exports = queries;
