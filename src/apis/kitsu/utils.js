import axios from "axios"

const BASE_URL = "https://kitsu.io/api/edge/"

// export async function getKitsuUserId(slug) {
//   const url = BASE_URL + "/users?filter[slug]=" + slug

//   try {
//     const res = await axios.get(url)
//     if (res.data.data.length) {
//       const userId = res.data.data[0].id
//       return Promise.resolve(userId)
//     } else {
//       return Promise.reject("User not found!")
//     }
//   } catch (error) {
//     return Promise.reject(error)
//   }
// }

export async function GetKitsuIdFromMalId(malid, type = "anime") {
  const url =
    BASE_URL +
    `mappings?filter[externalSite]=myanimelist/${type}&filter[external_id]=${malid}&include=item`
  try {
    const response = await axios.get(url)
    const kitsuId = response.data.data["0"].relationships.item.data.id
    return Promise.resolve(kitsuId)
  } catch (error) {
    console.error(error)
  }
}

export async function GetMalIdFromKitsuId(kitsuId, type = "anime") {
  try {
    const url =
      BASE_URL +
      `${type}/${kitsuId}/mappings?filter[externalSite]=myanimelist/${type}`
    const response = await axios.get(url)
    if (response.data.data.length) {
      const malId = response.data.data["0"].attributes.externalId
      return Promise.resolve(malId)
    } else {
      return Promise.resolve(null)
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * Extract required data from kitsu libraryentry resource.
 * @param {LibraryItem} libraryEntry
 */
export function KitsuParseLibraryEntry(libraryEntry) {
  return {
    progress: parseInt(libraryEntry.attributes.progress),
    status: libraryEntry.attributes.status,
    ratingTwenty:
      libraryEntry.attributes.ratingTwenty == null
        ? 0
        : parseInt(libraryEntry.attributes.ratingTwenty),
    createdAt: libraryEntry.attributes.createdAt,
    updatedAt: libraryEntry.attributes.updatedAt,
  }
}

/**
 * Extract required data from kitsu anime resource.
 * @param {AnimeItem} anime
 */
export async function KitsuParseAnime(anime) {
  const data = {
    kitsuId: anime.id,
    posterUrl: anime.attributes.posterImage.small,
    title: anime.attributes.canonicalTitle,
    showType: anime.attributes.subtype,
    synopsis: anime.attributes.synopsis,
    airDate: anime.attributes.startDate,
    totalEpisodes:
      anime.attributes.episodeCount == null
        ? -1
        : parseInt(anime.attributes.episodeCount),
    episodeLength:
      anime.attributes.episodeLength == null
        ? 20
        : parseInt(anime.attributes.episodeLength),
    averageRating:
      anime.attributes.averageRating == null
        ? "N/A"
        : anime.attributes.averageRating,
    categories: anime.relationships.categories.data.map((citem) => citem.id),
  }

  // Get MAL id
  const malId = await GetMalIdFromKitsuId(anime.id)
  data.malId = malId || "N/A"

  return Promise.resolve(data)
}
