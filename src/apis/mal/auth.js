const ipcRenderer = window.ipcRenderer

export function malLogin(username, password) {
  return new Promise((resolve, reject) => {
    ipcRenderer.once("mal-auth", (event, arg) => {
      console.log(arg) // prints "pong"
      if (arg.status) {
        resolve(arg.data)
      } else {
        reject(arg.data)
      }
    })
    ipcRenderer.send("mal-auth", { username, password })
  })
}
