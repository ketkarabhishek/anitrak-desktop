const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minHeight: 800,
      minWidth: 1200,
      darkTheme: true,
      icon: __dirname + '/anitrak_small.png',
      title: "AniTrak",
      backgroundColor: '#424242',
      resizable: false,
      // frame: false,
      show: false,
      webPreferences: {
        nodeIntegration: true,
      }
  });
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  })
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }
  // else{
  //   mainWindow.removeMenu();
  // }
  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});