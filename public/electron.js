const {app, BrowserWindow} = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

require('./main/ipc')

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minHeight: 800,
    minWidth: 1200,
    darkTheme: true,
    icon: path.join(__dirname, "main/icon.png"),
    title: "AniTrak",
    backgroundColor: "#424242",
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'main/preload.js'),
    },
  });
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }
  else{
    // mainWindow.removeMenu();
  
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.on("closed", () => (mainWindow = null));
}
 

app.on("ready", () => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

