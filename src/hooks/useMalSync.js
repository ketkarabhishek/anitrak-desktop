import { useEffect, useState } from "react"

import { DELETE, UPSERT } from "apis/constants"
import { getDatabase } from "db/rxdb"
import { malLogin } from "apis/mal/auth"
import {
  CreateMalEntry,
  UpdateMalEntry,
  DeleteMalEntry,
  GetMalAnimeList,
} from "apis/mal/library"
import { getMalStatusCode } from "apis/mal/utils"
import { useSnackbar } from "notistack"

export default function useMalSync(isConnected) {
  const [malCreds, setMalCreds] = useState(null)
  const [malSync, setMalSync] = useState(false)
  const [queue, setQueue] = useState([])
  const [malEntries, setMalEntries] = useState([])

  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    let websiteSub,
      queueSub = null
    async function setListeners() {
      const db = await getDatabase()

      websiteSub = db.website
        .findOne({ selector: { siteName: "mal" } })
        .$.subscribe(async (site) => {
          if (site != null) {
            setMalSync(site.sync)
            if (site.sync) {
              try {
                const creds = await malLogin(site.userName, site.password)
                console.log("MAL_CREDS: " + JSON.stringify(creds))

                setMalCreds(creds)

                const res = await GetMalAnimeList(site.userName)
                const malOnlineEntries = res.map((item) => parseInt(item.malId))
                console.log(malOnlineEntries)
                setMalEntries(malOnlineEntries)
              } catch (error) {
                console.log(error)
                enqueueSnackbar("MAL Sync: " + error, { varianr: "error" })
              }
            }
          }
        })

      queueSub = db.malqueue
        .find({ selector: { isSynced: false } })
        .$.subscribe((qitems) => {
          if (qitems != null && qitems !== undefined) {
            setQueue(qitems)
          }
        })
    }

    setListeners()
    return () => {
      if (websiteSub != null) {
        websiteSub.unsubscribe()
      }

      if (queueSub != null) {
        queueSub.unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    if (isConnected && malSync && queue.length && malCreds) {
      console.log(queue)
      queue.forEach(async (item) => {
        try {
          let response = null

          switch (item.task) {
            case UPSERT:
              const refdata = await item.data_
              const data = {
                num_watched_episodes: refdata.progress,
                anime_id: parseInt(refdata.malId),
                status: getMalStatusCode(refdata.status),
                score: parseInt(refdata.ratingTwenty / 2),
              }
              if (malEntries.includes(data.anime_id)) {
                response = await UpdateMalEntry(malCreds, data)
                console.log("MAL_UPDATE_RES: " + JSON.stringify(response))
              } else {
                response = await CreateMalEntry(malCreds, data)
                console.log("Mal_CREATE_RES: " + JSON.stringify(response))
                malEntries.push(data.anime_id)
              }
              await item.update({
                $set: {
                  isSynced: true,
                },
              })
              break

            case DELETE:
              console.log("MAL DELETE:", item.data)
              await DeleteMalEntry(malCreds, item.data)

              await item.update({
                $set: {
                  isSynced: true,
                },
              })

              break

            default:
              break
          }
        } catch (error) {
          console.error(error)
          enqueueSnackbar("MAL Sync: " + error, { varianr: "error" })
        }
      })
    }
  }, [isConnected, queue, malSync, malCreds, malEntries])

  return { malSync }
}
