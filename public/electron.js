/* eslint-disable @typescript-eslint/no-var-requires */
const { app, BrowserWindow, dialog, ipcMain, session } = require("electron");
const { autoUpdater } = require("electron-updater");
const grey = require("@material-ui/core/colors/grey");
const log = require("electron-log");
const path = require("path");
const isDev = require("electron-is-dev");
const windowStateKeeper = require("electron-window-state");
const unhandled = require("electron-unhandled");
const Store = require("electron-store");
const electronDl = require('electron-dl');

Store.initRenderer();

log.info("App starting");

electronDl();
unhandled();

let mainWindow;

function createWindow() {
  let state = windowStateKeeper({
    defaultWidth: 1024,
    defaultHeight: 768
  });

  mainWindow = new BrowserWindow({
    title: "Valheim+ Installer",
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 640,
    minHeight: 480,
    backgroundColor: grey[300],
    useContentSize: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });

 // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
 //   callback({
 //     responseHeaders: {
 //       ...details.responseHeaders,
 //       "Content-Security-Policy": [
 //         "style-src 'unsafe-inline'",
 //         "script-src 'unsafe-eval'",
 //         "default-src 'self'",
 //       ]
 //     }
 //   })
 // });

  state.manage(mainWindow);

  mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);
  if (isDev) {
    delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
    // Note to my future self:
    //   `electron-react-devtools` does NOT work, and will cause hangs.
    //   Remove the "%APPDATA%/[project]/DevTools Extension" file to fix.
    // DO NOT USE: BrowserWindow.addDevToolsExtension(path.join(__dirname, "../node_modules/electron-react-devtools"));
    mainWindow.webContents.openDevTools();
  }

  ipcMain.on("download", (event, info) => {
    info.properties.onProgress = status => mainWindow.webContents.send("download progress", status);
    electronDl.download(BrowserWindow.getFocusedWindow(), info.url, info.properties)
      .then(dl => mainWindow.webContents.send("download complete", dl.getSavePath()))
      .catch(error => mainWindow.webContents.send("download error", error))
  });

  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  setImmediate(() => log.info("App quitting"));

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

//
// Auto Updates
//
ipcMain.on("checkForUpdate", (event, fromMenu) => {
  if (isDev) {
    log.info("Checking for updates is disabled in Development mode");
    return;
  }

  autoUpdater.autoDownload = false;
  autoUpdater.allowPrerelease = true;
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = "info";

  autoUpdater.on("error", error => {
    const errorMessage = error == null ? "unknown" : (error.stack || error).toString();
    log.error("error", errorMessage);
    dialog.showErrorBox("Error: ", errorMessage);
  });

  autoUpdater.on("did-fail-load", error => {
    const errorMessage = error == null ? "update check failed" : (error.stack || error).toString();
    log.error("did-fail-load", errorMessage);
    dialog.showErrorBox(
      "Whoops! Something went wrong, please try again later.\nIf the problem persists, please report the following error:\n\n",
      errorMessage
    );
    mainWindow.webContents.send("updateComplete");
  });

  autoUpdater.on("update-available", () => {
    dialog
      .showMessageBox({
        type: "info",
        title: "Found Updates",
        message: "Found updates, do you want update now?",
        buttons: ["Sure", "No"]
      })
      .then(click => {
        if (click.response === 0) autoUpdater.downloadUpdate();
        else mainWindow.webContents.send("updateComplete");
      });
  });

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox({
        title: "Install Updates",
        message: "Updates downloaded, application will restart for update..."
      })
      .then(() => {
        setImmediate(() => autoUpdater.quitAndInstall());
      });
  });

  autoUpdater.on("update-not-available", () => {
    if (fromMenu) {
      dialog.showMessageBox({
        title: "No Updates",
        message: "Current version is up-to-date."
      });
    }
    mainWindow.webContents.send("updateComplete");
  });

  autoUpdater.checkForUpdates();
});
