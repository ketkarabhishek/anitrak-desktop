import { getDatabase } from "."
import { v4 as uuidv4 } from "uuid"
import { GetLibraryEntries } from "apis/kitsu/library"
import { GetMalAnimeList } from "apis/mal/library"
import { GetKitsuIdFromMalId } from "apis/kitsu/utils"
import { KitsuSearchById } from "apis/kitsu/search"
import { DELETE } from "apis/constants"

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

export async function importLibraryFromKitu(creds) {
  try {
    const kitsuEntries = await GetLibraryEntries(creds)

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
        // return await dbEntry.update({
        //     $set: {
        //         malEntry: true
        //     }
        // })
      } else {
        console.log("NOT EXISTS")
        const kitsuId = await GetKitsuIdFromMalId(entry.malId)
        const kitsuData = await KitsuSearchById(kitsuId)
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
