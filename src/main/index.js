'use strict'

import { app, BrowserWindow, Menu } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import { autoUpdater } from "electron-updater"

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
  const window = new BrowserWindow({webPreferences: {nodeIntegration: true, enableRemoteModule: true}})

  const template = [
    {
      role: 'fileMenu'
    },
    {
       label: 'Edit',
       submenu: [
          {
             label: 'Preferences',
             click(){createSettingsWindow()} 
          }
       ]
    }
 ]
 
 const menu = Menu.buildFromTemplate(template)
 Menu.setApplicationMenu(menu)

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

  return window
}

function createSettingsWindow() {
  const window = new BrowserWindow({title: "Preferences", webPreferences: {nodeIntegration: true, enableRemoteModule: true}})

  window.removeMenu();

  if (isDevelopment) {
    window.webContents.openDevTools()
  }


    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'settings.html'),
      protocol: 'file',
      slashes: true
    }))
  

  window.on('closed', () => {
    mainWindow.reload();
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