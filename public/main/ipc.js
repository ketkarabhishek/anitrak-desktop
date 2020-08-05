const { ipcMain } = require('electron')
const {AnimeEdit, AnimeAdd, AnimeDelete} = require('./mal/library')

ipcMain.on('mal-auth', (event, arg) => {
  console.log(arg) // prints "ping"
  const malLogin = require("./mal/auth");

  malLogin(arg.username, arg.password).then((loginData) => {
      console.log(loginData)
      if(loginData){
          event.reply('mal-auth', {status: true, data: loginData})
      }
      else{
        event.reply('mal-auth', {status: false, data: 'Mal login failed.'})
      }
  }).catch((err) => {
      console.error(err);
      event.reply('mal-auth', {status: false, data: err})
  })
  
})

ipcMain.on('mal-add', (event, arg) => {
  console.log(arg)
  AnimeAdd(arg.loginData, arg.entryData).then((res) => event.reply('mal-add', {status: true, data: res}))
  .catch((err) => event.reply('mal-add', {status: false, data: err}))
})

ipcMain.on('mal-edit', (event, arg) => {
  console.log(arg)
  AnimeEdit(arg.loginData, arg.entryData).then((res) => event.reply('mal-edit', {status: true, data: res}))
  .catch((err) => event.reply('mal-edit', {status: false, data: err}))
})

ipcMain.on('mal-delete', (event, arg) => {
  console.log(arg)
  AnimeDelete(arg.loginData, arg.entryData).then((res) => event.reply('mal-delete', {status: true, data: res}))
  .catch((err) => event.reply('mal-delete', {status: false, data: err}))
})

