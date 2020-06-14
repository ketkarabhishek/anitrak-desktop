import Mal from "node-myanimelist"
import { getKitsuStatusCode } from "./utils"

const ipcRenderer = window.ipcRenderer

export async function GetMalUserId(username) {
  try {
    const user = await Mal.user(username).profile()
    console.log(user.data.user_id)
    return Promise.resolve(user.data.user_id)
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function GetMalAnimeList(username) {
  try {
    const user = Mal.user(username)
    const profile = await user.profile()
    const total = profile.data.anime_stats.total_entries
    console.log(total)
    let animelist = []
    let i = 1

    while (true) {
      const res = await user.animelist(i).all()

      if (res.data.anime.length > 0) {
        animelist = animelist.concat(res.data.anime)
        i++
      } else {
        break
        // return Promise.resolve(animelist)
      }
    }

    const pmalLibrary = animelist.map((item) => ({
      malId: item.mal_id.toString(),
      title: item.title,
      ratingTwenty: item.score * 2,
      progress: item.watched_episodes,
      status: getKitsuStatusCode(item.watching_status),
    }))
    const malLibrary = await Promise.all(pmalLibrary)
    return malLibrary
  } catch (error) {
    return Promise.reject(error)
  }
}

export function CreateMalEntry(loginData, entryData) {
  return new Promise((resolve, reject) => {
    ipcRenderer.once("mal-add", (event, arg) => {
      console.log(arg) // prints "pong"
      if (arg.status) {
        resolve(arg.data)
      } else {
        reject(arg.data)
      }
    })
    ipcRenderer.send("mal-add", { loginData, entryData })
  })
}

export function UpdateMalEntry(loginData, entryData) {
  return new Promise((resolve, reject) => {
    ipcRenderer.once("mal-edit", (event, arg) => {
      console.log(arg) // prints "pong"
      if (arg.status) {
        resolve(arg.data)
      } else {
        reject(arg.data)
      }
    })
    ipcRenderer.send("mal-edit", { loginData, entryData })
  })
}

export function DeleteMalEntry(loginData, entryData) {
  return new Promise((resolve, reject) => {
    ipcRenderer.once("mal-delete", (event, arg) => {
      console.log(arg) // prints "pong"
      if (arg.status) {
        resolve(arg.data)
      } else {
        reject(arg.data)
      }
    })
    ipcRenderer.send("mal-delete", { loginData, entryData })
  })
}
