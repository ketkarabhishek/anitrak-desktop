// import { GetMalFromKitsu } from "./kitsu-helper";
import { BASE_URL } from "./constants"
import axios from "axios"
import { GetMalIdFromKitsuId } from "./utils"

const baseUrl = BASE_URL + "users"

export async function GetLibraryEntries(token) {
  const url =
    baseUrl +
    "/" +
    token.userId +
    "/library-entries?filter[kind]=anime&include=anime.categories,anime.mappings&page[limit]=100"

  let resJson = await makeRequest(url, token)
  const totalItemCount = resJson.meta.count
  console.log("COUNT" + totalItemCount)

  //Array of Library entries
  let libraryEntries = await extractEntryFromJson(resJson)

  while (resJson.links.next !== "undefined" && resJson.links.next != null) {
    resJson = await makeRequest(resJson.links.next, token)
    libraryEntries = libraryEntries.concat(await extractEntryFromJson(resJson))
  }

  if (resJson.links.next === "undefined" || resJson.links.next == null) {
    console.log(libraryEntries)
    return libraryEntries
  }
}

async function makeRequest(url, token) {
  const options = {
    url: url,
    method: "GET",
    headers: {
      "cache-control": "no-cache",
      Authorization: "Bearer " + token.access_token,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  }
  console.log("Options Body: ", JSON.stringify(options))
  try {
    const res = await axios(options)
    return Promise.resolve(res.data)
  } catch (error) {
    console.error(error)
    return Promise.reject(error)
  }
}

async function extractEntryFromJson(resJson) {
  //Get keys of all entries
  const keys = Object.keys(resJson.data)

  const pArray = resJson.data.map(async (item, index) => {
    let key = keys[index]
    const entry = {}

    entry.kitsuEntryId = item["id"]
    entry.progress = parseInt(item["attributes"]["progress"])
    entry.status = item["attributes"]["status"]
    // entry.reconsumeCount = parseInt(
    //   item["attributes"]["reconsumeCount"]
    // );
    entry.ratingTwenty =
      item["attributes"]["ratingTwenty"] == null
        ? 0
        : parseInt(item["attributes"]["ratingTwenty"])
    entry.averageRating = item["attributes"]["averageRating"]
    entry.createdAt = item["attributes"]["createdAt"]
    entry.updatedAt = item["attributes"]["updatedAt"]

    // Included
    entry.kitsuId = resJson.included[key]["id"]

    entry.title = resJson.included[key]["attributes"]["canonicalTitle"]

    entry.posterUrl =
      resJson.included[key]["attributes"]["posterImage"]["small"]

    entry.totalEpisodes =
      resJson.included[key]["attributes"]["episodeCount"] == null
        ? -1
        : parseInt(resJson.included[key]["attributes"]["episodeCount"])

    entry.episodeLength =
      resJson.included[key]["attributes"]["episodeLength"] == null
        ? 20
        : parseInt(resJson.included[key]["attributes"]["episodeLength"])

    entry.showType = resJson.included[key]["attributes"]["showType"]
    entry.averageRating =
      resJson.included[key]["attributes"]["averageRating"] == null
        ? "N/A"
        : resJson.included[key]["attributes"]["averageRating"]
    entry.synopsis = resJson.included[key]["attributes"]["synopsis"]
    entry.airDate = resJson.included[key]["attributes"]["startDate"]

    //Categories

    entry.categories = resJson.included[key]["relationships"]["categories"][
      "data"
    ].map((catg) => catg.id)

    // Get MAL id
    const malId = await GetMalIdFromKitsuId(resJson.included[key]["id"])
    if (malId != null) {
      entry.malId = malId
    } else {
      entry.malId = "N/A"
    }

    return entry
  })

  const entries = await Promise.all(pArray)
  return entries
}

export async function getKitsuEntryId(kitsuId, creds) {
  const options = {
    url:
      baseUrl +
      `/${creds.userId}/library-entries?filter[animeId]=${kitsuId}&fields[library-entries]=id`,
    method: "GET",
    headers: {
      "cache-control": "no-cache",
      Authorization: "Bearer " + creds.access_token,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
  }

  try {
    const res = await axios(options)
    console.log(res.data)

    if (res.data.data.length) {
      return Promise.resolve(res.data.data[0].id)
    } else {
      return Promise.resolve(null)
    }
  } catch (error) {
    console.error(error)
    return Promise.reject(error)
  }
}

//Create Library Entries
export async function CreateKitsuEntry(kitsuAuth, mdata) {
  const body = {
    data: {
      type: "libraryEntries",
      attributes: {
        status: mdata.status,
        progress: mdata.progress,
        ratingTwenty: mdata.ratingTwenty >= 2 ? mdata.ratingTwenty : null,
      },
      relationships: {
        user: {
          data: {
            id: kitsuAuth.userId,
            type: "users",
          },
        },
        media: {
          data: {
            id: mdata.kitsuId,
            type: "anime",
          },
        },
      },
    },
  }

  const options = {
    url: BASE_URL + "library-entries",
    method: "POST",
    headers: {
      "cache-control": "no-cache",
      Authorization: "Bearer " + kitsuAuth.access_token,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    data: JSON.stringify(body),
  }
  console.log(JSON.stringify(body))

  try {
    const res = await axios(options)
    return Promise.resolve(res.data)
  } catch (error) {
    return Promise.reject(error)
  }
}

// Update Kitsu Library entries
export async function UpdateKitsuEntry(kitsuAuth, data) {
  const body = {
    data: {
      type: "libraryEntries",
      id: data.kitsuEntryId,
      attributes: {
        status: data.status,
        progress: data.progress,
        ratingTwenty: data.ratingTwenty >= 2 ? data.ratingTwenty : null,
      },
    },
  }

  const options = {
    url: BASE_URL + "library-entries/" + data.kitsuEntryId,
    method: "PATCH",
    headers: {
      "cache-control": "no-cache",
      Authorization: "Bearer " + kitsuAuth.access_token,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    data: JSON.stringify(body),
  }

  try {
    const res = await axios(options)
    console.log(res)
    return Promise.resolve(res)
  } catch (error) {
    console.error(error.body)
    return Promise.reject(error.body)
  }
}

// Delete Kitsu Library entries
export async function DeleteKitsuEntry(kitsuAuth, data) {
  const options = {
    url: BASE_URL + "library-entries/" + data,
    method: "DELETE",
    headers: {
      "cache-control": "no-cache",
      Authorization: "Bearer " + kitsuAuth.access_token,
      "Content-Type": "application/vnd.api+json",
    },
  }
  console.log("Delete Options: " + JSON.stringify(options))

  try {
    const response = await axios(options)
    if (response.status === 204) {
      console.log("Delete req successful")
      return Promise.resolve()
    }
  } catch (error) {
    console.error(error.body)
    return Promise.reject(error.body)
  }
}
