import { useEffect, useState } from "react"
import {
  CreateKitsuEntry,
  UpdateKitsuEntry,
  DeleteKitsuEntry,
  getKitsuEntryId,
} from "apis/kitsu/library"

import { getDatabase } from "db/rxdb"
import { KitsuLogin } from "apis/kitsu/auth"
import { UPSERT, DELETE } from "apis/constants"
import { useSnackbar } from "notistack"

export default function useKitsuSync(isConnected) {
  const [kitsuCreds, setKitsuCreds] = useState(null)
  const [kitsuSync, setKitsuSync] = useState(false)
  const [queue, setQueue] = useState([])

  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    let websiteSub,
      queueSub = null
    async function setListeners() {
      const db = await getDatabase()

      websiteSub = db.website
        .findOne({ selector: { siteName: "kitsu" } })
        .$.subscribe(async (site) => {
          if (site != null) {
            setKitsuSync(site.sync)
            if (site.sync) {
              try {
                const creds = await KitsuLogin(site.userName, site.password)
                creds.userId = site.userId
                console.log("KITSU_CREDS: " + JSON.stringify(creds))
                setKitsuCreds(creds)
              } catch (error) {
                console.error(error)
                enqueueSnackbar("Kitsu Sync: " + error, { variant: "error" })
              }
            }
          }
        })

      queueSub = db.kitsuqueue
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
    if (isConnected && kitsuSync && queue.length && kitsuCreds) {
      queue.forEach(async (item) => {
        try {
          let response = null
          let kitsuEntryId = null
          switch (item.task) {
            case UPSERT:
              const res = await item.data_
              const data = {
                kitsuId: res.kitsuId,
                progress: res.progress,
                status: res.status,
                ratingTwenty: res.ratingTwenty,
              }
              kitsuEntryId = await getKitsuEntryId(data.kitsuId, kitsuCreds)
              console.log(kitsuEntryId)
              if (kitsuEntryId == null) {
                response = await CreateKitsuEntry(kitsuCreds, data)
                console.log("KITSU_CREATE_RES: " + JSON.stringify(response))
              } else {
                data.kitsuEntryId = kitsuEntryId
                response = await UpdateKitsuEntry(kitsuCreds, data)
                console.log("KITSU_UPDATE_RES: " + JSON.stringify(response))
              }
              await item.update({
                $set: {
                  isSynced: true,
                },
              })
              break

            case DELETE:
              console.log(item.data)
              kitsuEntryId = await getKitsuEntryId(item.data, kitsuCreds)
              console.log(kitsuEntryId)
              if (kitsuEntryId != null) {
                await DeleteKitsuEntry(kitsuCreds, kitsuEntryId)
              }

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
          enqueueSnackbar("Kitsu Sync: " + error, { variant: "error" })
        }
      })
    }
  }, [isConnected, queue, kitsuSync, kitsuCreds])

  return { kitsuSync }
}
