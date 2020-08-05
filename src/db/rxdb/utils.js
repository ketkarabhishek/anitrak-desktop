import { getDatabase } from "."
import { v4 as uuidv4 } from "uuid"
import { GetMalAnimeList } from "apis/mal/library"
import {
  GetKitsuIdFromMalId,
  KitsuParseLibraryEntry,
  KitsuParseAnime,
} from "apis/kitsu/utils"
import { DELETE } from "apis/constants"
import KitsuApi from "kitsu-api-wrapper"

/**
 * Add new task to sync queue.
 * @param {string} task
 * @param {object} data
 */
export async function addSyncTaskToQueue(task, data) {
  const db = await getDatabase()
  const kitsuSite = await db.website
    .findOne({ selector: { siteName: "kitsu" } })
    .exec()
  const malSite = await db.website
    .findOne({ selector: { siteName: "mal" } })
    .exec()

  if (kitsuSite) {
    await db.kitsuqueue.insert({
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      task: task,
      data: task === DELETE ? data.kitsuId : data,
    })
  }

  if (malSite) {
    await db.malqueue.insert({
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      task: task,
      data: task === DELETE ? data.malId : data,
    })
  }

  return Promise.resolve()
}

/**
 * Import Kitsu library.
 * @param {Object} kitsuAuthToken
 * @param {(string | number)} userId
 */
export async function importLibraryFromKitu(kitsuAuthToken, userId) {
  try {
    const kitsuApi = new KitsuApi()
    const query = kitsuApi.library.fetch(
      {
        filter: { kind: "anime", userId: userId },
        include: "anime.categories",
        page: { limit: 50 },
      },
      kitsuAuthToken
    )
    let res = await query.exec()
    let kitsuEntries = await parseKitsuLibraryEntry(res)
    console.log(res.data.length)

    while (query.nextUrl) {
      res = await query.next()
      kitsuEntries = kitsuEntries.concat(await parseKitsuLibraryEntry(res))
      console.log(res.data.length)
    }

    const db = await getDatabase()
    const dbLibrary = await db.library.find().exec()

    if (dbLibrary == null || dbLibrary.length === 0) {
      const insertResult = await db.library.bulkInsert(kitsuEntries)
      return Promise.resolve(insertResult)
    } else {
      const pimports = kitsuEntries.map(async (entry) => {
        const dbEntry = await db.library
          .findOne({ selector: { kitsuId: entry.kitsuId } })
          .exec()
        if (!dbEntry) {
          const inserted = await db.library.insert(entry)
          return inserted
        }
      })

      const imports = await Promise.all(pimports)
      return imports
    }
  } catch (error) {
    console.error(error)
    return Promise.reject(error)
  }
}

/**
 * Import MAL library.
 * @param {string} userName
 */
export async function importLibraryFromMal(userName) {
  try {
    const malEntries = await GetMalAnimeList(userName)
    const db = await getDatabase()

    const pimports = malEntries.map(async (entry) => {
      const dbEntry = await db.library
        .findOne({ selector: { malId: entry.malId } })
        .exec()
      if (dbEntry) {
        console.log("EXISTS")
        console.log(dbEntry)
      } else {
        console.log("NOT EXISTS")
        const kitsuId = await GetKitsuIdFromMalId(entry.malId)
        const kitsuApi = new KitsuApi()
        const res = await kitsuApi.anime.fetchById(kitsuId)
        const kitsuData = await KitsuParseAnime(res.data)
        // const kitsuData = await KitsuSearchById(kitsuId)
        kitsuData.malId = entry.malId
        kitsuData.malEntry = true
        kitsuData.status = entry.status
        kitsuData.progress = entry.progress
        kitsuData.ratingTwenty = entry.ratingTwenty

        return await db.library.insert(kitsuData)
      }
    })

    return await Promise.all(pimports)
  } catch (error) {
    console.error(error)
    return Promise.reject(error)
  }
}

async function parseKitsuLibraryEntry(resJson) {
  //Get keys of all entries
  const keys = Object.keys(resJson.data)

  const pArray = resJson.data.map(async (item, index) => {
    let key = keys[index]

    const libraryEntry = KitsuParseLibraryEntry(item)
    const anime = await KitsuParseAnime(resJson.included[key])

    const entry = {
      ...libraryEntry,
      ...anime,
    }

    return entry
  })

  const entries = await Promise.all(pArray)
  return Promise.resolve(entries)
}
