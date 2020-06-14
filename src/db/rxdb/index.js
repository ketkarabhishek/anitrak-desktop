import { createRxDatabase, addRxPlugin, removeRxDatabase } from "rxdb"
import idb from "pouchdb-adapter-idb"
import memory from "pouchdb-adapter-memory"
import {
  librarySchema,
  websiteSchema,
  categorySchema,
  kitsuQueueSchema,
  malQueueSchema,
} from "./schema"
import { v4 as uuidv4 } from "uuid"
import { CURRENT, COMPLETED } from "apis/constants"
addRxPlugin(idb)
addRxPlugin(memory)

const collections = [
  {
    name: "library",
    schema: librarySchema,
    statics: {
      findById: async function (id) {
        const result = await this.findOne({ selector: { id: id } }).exec()
        return result
      },
    },
  },
  {
    name: "website",
    schema: websiteSchema,
  },
  {
    name: "categories",
    schema: categorySchema,
  },
  {
    name: "kitsuqueue",
    schema: kitsuQueueSchema,
  },
  {
    name: "malqueue",
    schema: malQueueSchema,
  },
]

let dbPromise = null

async function createDb() {
  try {
    // const adapter = process.env.NODE_ENV === 'development' ? 'memory' : 'idb'
    const db = await createRxDatabase({
      name: "anitrakdb",
      adapter: "idb",
      password: "myLongAndStupidPassword",
    })
    console.log("Database created!")

    const genCollections = await Promise.all(
      collections.map((colData) => db.collection(colData))
    )
    console.log("Collection generated!")
    console.log(genCollections)

    // await db.kitsuqueue.remove()
    // await db.library.remove()
    // await db.malqueue.remove()
    // Hooks
    db.library.preInsert((libraryEntry) => {
      libraryEntry.id = uuidv4()
      if (
        libraryEntry.createdAt === undefined ||
        libraryEntry.createdAt == null
      ) {
        libraryEntry.createdAt = new Date().toISOString()
      }
      if (
        libraryEntry.updatedAt === undefined ||
        libraryEntry.updatedAt == null
      ) {
        libraryEntry.updatedAt = new Date().toISOString()
      }
    }, true)

    db.library.preSave((libraryEntry, rxdoc) => {
      if (libraryEntry.status === COMPLETED) {
        if (libraryEntry.totalEpisodes > 0) {
          libraryEntry.progress = libraryEntry.totalEpisodes
        } else {
          libraryEntry.status = CURRENT
        }
      }

      if (
        libraryEntry.progress === libraryEntry.totalEpisodes &&
        libraryEntry.totalEpisodes > 0
      ) {
        libraryEntry.status = COMPLETED
      }
    }, true)

    return db
  } catch (error) {
    console.error(error)
  }
}

export function getDatabase() {
  // removeRxDatabase('anitrakdb', 'idb')
  if (!dbPromise) dbPromise = createDb()
  return dbPromise
}
