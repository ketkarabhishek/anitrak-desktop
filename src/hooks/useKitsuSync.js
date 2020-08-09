import { useEffect, useState } from "react"

import { getDatabase } from "db/rxdb"
import { UPSERT, DELETE } from "apis/constants"
import { useSnackbar } from "notistack"
import KitsuApi from "kitsu-api-wrapper"

export default function useKitsuSync(isConnected) {
  const [userId, setUserId] = useState("null")
  const [kitsuCreds, setKitsuCreds] = useState(null)
  const [kitsuSync, setKitsuSync] = useState(false)
  const [queue, setQueue] = useState([])

  const { enqueueSnackbar } = useSnackbar()

  const kitsuApi = new KitsuApi()

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
                const creds = await kitsuApi.auth.login(
                  site.userName,
                  site.password
                )
                console.log("KITSU_CREDS: " + JSON.stringify(creds))
                setUserId(site.userId)
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
      const library = kitsuApi.library
      queue.forEach(async (item) => {
        try {
          let response = null
          let kitsuEntryId = null

          switch (item.task) {
            case UPSERT:
              const res = await item.data_
              const data = {
                animeId: res.kitsuId,
                progress: res.progress,
                status: res.status,
                ratingTwenty: res.ratingTwenty,
              }

              // Get Kitsu library entry id.
              let query = library.fetch({
                filter: { animeId: data.animeId, userId: userId },
                page: { limit: 1 },
              })
              let result = await query.exec()
              if (result.data.length) {
                kitsuEntryId = result.data[0].id
              }
              console.log(kitsuEntryId)
              if (kitsuEntryId) {
                data.libraryEntryId = kitsuEntryId
                response = await library.update(data, kitsuCreds)
                console.log("KITSU_UPDATE_RES: " + JSON.stringify(response))
              } else {
                response = await library.create(userId, data, kitsuCreds)
                console.log("KITSU_CREATE_RES: " + JSON.stringify(response))
              }
              await item.update({
                $set: {
                  isSynced: true,
                },
              })
              break

            case DELETE:
              console.log(item.data)
              // Get Kitsu library entry id.
              const deletequery = library.fetch({
                filter: { animeId: item.data, userId: userId },
                page: { limit: 1 },
              })
              const dresult = await deletequery.exec()
              if (dresult.data.length) {
                console.log(kitsuEntryId)
                await library.delete(
                  { libraryEntryId: dresult.data[0].id },
                  kitsuCreds
                )
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
