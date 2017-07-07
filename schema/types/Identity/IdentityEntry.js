const Identity = `

  type AvatarImage {
    id: String
    url: String
    originId: String
  }

  type Organization {
    id: String
    namespace: String
    name: String
    website: String
  }

  type Preferences {
    locale: String
    timezone: String
    language: [String]
  }

  type Identity {
    id: String

    lastName: String
    firstName: String

    city: String
    state: String
    country: String

    bio: String
    jobTitle: String

    organization: Organization

    organizations: [Organization]

    avatarImage: AvatarImage

    roles: [String]

    email: String
    phoneNumber: String
    twitterHandle: String
    linkedInUrl: String

    externallyManaged: Boolean
    userType: String
    tokenType: String

  }
`;

module.exports = () => [Identity];
