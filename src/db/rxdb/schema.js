export const librarySchema = {
  title: "Library schema",
  description: "Library Schema",
  version: 0,
  type: "object",
  properties: {
    id: {
      type: "string",
      primary: true,
    },
    kitsuId: {
      type: "string",
    },
    malId: {
      type: "string",
    },
    kitsuEntryId: {
      type: "string",
      default: "N/A",
    },
    malEntry: {
      type: "boolean",
      default: false,
    },
    progress: {
      type: "integer",
      default: 0,
    },
    status: {
      type: "string",
    },
    ratingTwenty: {
      type: "integer",
    },
    averageRating: {
      type: "string",
    },
    totalEpisodes: {
      type: "integer",
    },
    episodeLength: {
      type: "integer",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    airDate: {
      type: "string",
    },
    title: {
      type: "string",
    },
    showType: {
      type: "string",
    },
    posterUrl: {
      type: "string",
    },
    synopsis: {
      type: "string",
    },
    categories: {
      type: "array",
      uniqueItems: true,
      item: {
        type: "string",
      },
    },
  },
  indexes: ["createdAt", "updatedAt", "ratingTwenty", "averageRating"],
}

export const websiteSchema = {
  title: "Website Schema",
  description: "Tracking website data",
  version: 0,
  type: "object",
  properties: {
    siteName: {
      type: "string",
      primary: true,
    },
    userId: {
      type: "string",
      default: "N/A",
    },
    userName: {
      type: "string",
    },
    password: {
      type: "string",
    },
    sync: {
      type: "boolean",
      default: false,
    },
  },
  encrypted: ["password"],
}

export const categorySchema = {
  title: "Category Schema",
  description: "Anime Categories",
  version: 0,
  type: "object",
  properties: {
    id: {
      type: "string",
      primary: true,
    },
    title: {
      type: "string",
    },
  },
}

export const kitsuQueueSchema = {
  title: "Kitsu Queue Schema",
  description: "Kitsu Sync Queue",
  version: 0,
  type: "object",
  properties: {
    id: {
      type: "string",
      primary: true,
    },
    createdAt: {
      type: "string",
    },
    isSynced: {
      type: "boolean",
      default: false,
    },
    task: {
      type: "string",
    },
    data: {
      type: "string",
      ref: "library",
    },
  },
  indexes: ["createdAt"],
}

export const malQueueSchema = {
  title: "MAL Queue Schema",
  description: "MAL Sync Queue",
  version: 0,
  type: "object",
  properties: {
    id: {
      type: "string",
      primary: true,
    },
    createdAt: {
      type: "string",
    },
    isSynced: {
      type: "boolean",
      default: false,
    },
    task: {
      type: "string",
    },
    data: {
      type: "string",
      ref: "library",
    },
  },
  indexes: ["createdAt"],
}
