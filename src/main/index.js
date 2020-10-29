const {app, BrowserWindow, Menu, ipcMain } = require('electron');
const contextMenu = require('electron-context-menu');
const autoUpdater = require('electron-updater');
const { shell } = require('electron');


import * as path from 'path'
import { format as formatUrl } from 'url'

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
  const window = new BrowserWindow({
    title: 'HyperDeckctl',
    width: 1300,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  window.removeMenu();

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.on('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  window.webContents.on('open-ftp', () => {
    console.log("OPEN THE FTP");
    shell.openExternal('https://github.com')
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})

contextMenu({
  prepend: (defaultActions, params, browserWindow) => [
    {
      label: 'Manage decks',
      // Only show it when right-clicking text
      visible: true,
      click: () => {
        mainWindow.webContents.send('manage-decks');
      }
    }
  ]
});

ipcMain.on('open-ftp', (event, arg) => {
  console.log(arg) // prints "ping"
  shell.openExternal(arg);
})