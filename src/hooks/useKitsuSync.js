import { useEffect, useState, useContext } from "react"

import { getDatabase } from "db/rxdb"
import { UPSERT, DELETE } from "apis/constants"
import { useSnackbar } from "notistack"
import KitsuApi from "kitsu-api-wrapper"
import { AuthTokenContext } from "Contexts/AuthTokenContext"
import { setKitsuToken } from "Contexts/AuthTokenContext"

export default function useKitsuSync(isConnected) {
  const [kitsuCreds, setKitsuCreds] = useState(null)
  const [kitsuSync, setKitsuSync] = useState(false)
  const [kitsuSite, setKitsuSite] = useState(null)
  const [queue, setQueue] = useState([])

  const { enqueueSnackbar } = useSnackbar()

  const { state, dispatch } = useContext(AuthTokenContext)
  const { kitsuAccessToken } = state

  const kitsuApi = new KitsuApi()

  const getKitsuEntryId = async (animeId, userId) => {
    let query = kitsuApi.library.fetch({
      filter: { animeId: animeId, userId: userId },
      page: { limit: 1 },
    })

    try {
      const result = await query.exec()
      if (result.data.length) {
        return Promise.resolve(result.data[0].id)
      }
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  useEffect(() => {
    let websiteSub,
      queueSub = null
    async function setListeners() {
      const db = await getDatabase()

      websiteSub = db.website
        .findOne({ selector: { siteName: "kitsu" } })
        .$.subscribe(async (site) => {
          if (site != null) {
            setKitsuSite(site)
            setKitsuSync(site.sync)
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

  /**
   * Auth Effect
   */
  useEffect(() => {
    async function getToken() {
      try {
        const creds = await kitsuApi.auth.refreshAccessToken(kitsuSite.password)

        dispatch(setKitsuToken(creds.access_token))
        console.log("KITSU_TOKEN: " + JSON.stringify(creds))
        setKitsuCreds(creds)

        await kitsuSite.update({
          $set: {
            password: creds.refresh_token,
          },
        })
      } catch (error) {
        console.error(error)
        enqueueSnackbar("Kitsu Auth: " + error, { variant: "error" })
      }
    }

    if (kitsuSync && kitsuSite && !kitsuAccessToken) {
      getToken()
    }
  }, [kitsuSync])

  /**
   * Sync Logic
   */
  useEffect(() => {
    if (isConnected && kitsuSync && queue.length && kitsuAccessToken) {
      const library = kitsuApi.library
      queue.forEach(async (item) => {
        try {
          switch (item.task) {
            case UPSERT:
              const res = await item.data_
              const data = {
                animeId: res.kitsuId,
                progress: res.progress,
                status: res.status,
                ratingTwenty: res.ratingTwenty,
              }

              const kitsuEntryId = await getKitsuEntryId(
                data.animeId,
                kitsuSite.userId
              )
              console.log(kitsuEntryId)
              let response = null
              if (kitsuEntryId) {
                data.libraryEntryId = kitsuEntryId
                response = await library.update(data, {
                  access_token: kitsuAccessToken,
                })
                console.log("KITSU_UPDATE_RES: " + JSON.stringify(response))
              } else {
                response = await library.create(kitsuSite.userId, data, {
                  access_token: kitsuAccessToken,
                })
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
              const delEntryId = await getKitsuEntryId(
                item.data,
                kitsuSite.userId
              )
              if (delEntryId) {
                await library.delete(
                  { libraryEntryId: delEntryId },
                  { access_token: kitsuAccessToken }
                )

                await item.update({
                  $set: {
                    isSynced: true,
                  },
                })
              }

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
