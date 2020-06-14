import { BASE_URL } from "./constants"
import axios from "axios"

export async function GetAllCategories() {
  try {
    const url = BASE_URL + "categories?page[limit]=300"
    const resJson = await axios.get(url)
    const categories = resJson.data.data.map((element) => {
      const category = {
        id: element.id,
        title: element.attributes.title,
      }
      return category
    })

    return Promise.resolve(categories)
  } catch (error) {
    console.error(error)
  }
}

export async function getKitsuUserId(slug) {
  const url = BASE_URL + "/users?filter[slug]=" + slug

  try {
    const res = await axios.get(url)
    if (res.data.data.length) {
      const userId = res.data.data[0].id
      return Promise.resolve(userId)
    } else {
      return Promise.reject("User not found!")
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

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
