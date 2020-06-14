import { TOKEN_URL } from "./constants"
import axios from "axios"

const CLIENTID =
  "dd031b32d2f56c990b1425efe6c42ad847e7fe3ab46bf1299f05ecd856bdb7dd"
const CLIENTSECRET =
  "54d7307928f63414defd96399fc31ba847961ceaecef3a5fd93144e960c0e151"

export async function KitsuLogin(username, password) {
  const options = {
    url: TOKEN_URL,
    method: "post",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    data: JSON.stringify({
      grant_type: "password",
      client_id: CLIENTID,
      client_secret: CLIENTSECRET,
      username: username,
      password: password,
    }),
  }

  try {
    const res = await axios(options)
    return Promise.resolve(res.data)
  } catch (error) {
    return Promise.reject(error)
  }
}
