import { BASE_URL } from "./constants"
import axios from "axios"
import { GetMalIdFromKitsuId } from "./utils"

export async function KitsuSearch(key, filters) {
  const url =
    BASE_URL +
    "anime?page[limit]=20&filter[text]=" +
    key +
    "&include=categories"

  try {
    const response = await axios.get(url)
    const presults = response.data.data.map(async (item) => {
      const data = await extractDataFromJson(item)
      data.malId = await GetMalIdFromKitsuId(data.kitsuId)
      // console.log(data.malId);

      return data
    })
    const results = await Promise.all(presults)
    return Promise.resolve(results)
  } catch (error) {
    console.error(error)
  }
}

export async function KitsuSearchById(kitsuId, type = "anime") {
  try {
    const url = BASE_URL + `${type}/${kitsuId}?include=categories`

    const response = await axios.get(url)
    const data = await extractDataFromJson(response.data.data)

    return Promise.resolve(data)
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function KitsuSearchByMalId(malId, type = "anime") {
  try {
    const url = BASE_URL + `${type}/${malId}?include=categories`

    const response = await axios.get(url)
    const data = await extractDataFromJson(response.data.data)
    console.log(response.data)
    return Promise.resolve(data)
  } catch (error) {
    return Promise.reject(error)
  }
}

async function extractDataFromJson(resJson) {
  const data = {
    kitsuId: resJson["id"],
    posterUrl: resJson["attributes"]["posterImage"]["small"],
    title: resJson["attributes"]["canonicalTitle"],
    showType: resJson["attributes"]["subtype"],
    synopsis: resJson["attributes"]["synopsis"],
    airDate: resJson["attributes"]["startDate"],
    progress: 0,
    totalEpisodes:
      resJson["attributes"]["episodeCount"] == null
        ? -1
        : parseInt(resJson["attributes"]["episodeCount"]),
    episodeLength:
      resJson["attributes"]["episodeLength"] == null
        ? 20
        : parseInt(resJson["attributes"]["episodeLength"]),
    averageRating:
      resJson["attributes"]["averageRating"] == null
        ? "N/A"
        : resJson["attributes"]["averageRating"],
    ratingTwenty: 0,
    status: "Add",
  }
  data.categories = resJson["relationships"]["categories"]["data"].map(
    (citem) => citem.id
  )
  return Promise.resolve(data)
}
