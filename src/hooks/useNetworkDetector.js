import { useState, useEffect } from "react"
import { useSnackbar } from "notistack"
import axios from "axios"

export default function useNetworkDetector() {
  const [isConnected, setIsConnected] = useState(navigator.onLine)
  const { enqueueSnackbar } = useSnackbar()

  const handleConnectionChange = () => {
    const online = navigator.onLine

    if (online) {
      console.log("timeout")
      const ping = setInterval(async () => {
        try {
          const res = await axios.get("https://kitsu.io/api/edge/users")
          console.log(res.status)
          if (res.status === 200) {
            setIsConnected(true)
            enqueueSnackbar("You are Online!", { variant: "info" })
            return clearInterval(ping)
          }
        } catch (error) {
          setIsConnected(false)
          // enqueueSnackbar(error, {variant: 'error'})
          console.log("Offline!")
        }
      }, 5000)
    } else {
      setIsConnected(false)
      enqueueSnackbar("You are offline!", { variant: "warning" })
    }
  }

  useEffect(() => {
    if (!isConnected) {
      enqueueSnackbar("You are offline!", { variant: "warning" })
    }
    window.addEventListener("online", handleConnectionChange)
    window.addEventListener("offline", handleConnectionChange)
    return () => {
      window.removeEventListener("online", handleConnectionChange)
      window.removeEventListener("offline", handleConnectionChange)
    }
  }, [])

  return isConnected
}
