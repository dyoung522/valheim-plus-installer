import path from "path";
import { aboutMenuItem } from "electron-util";

const iconPath = path.join("public", "favicon.ico");
const homePage = "https://github.com/dyoung522/valheim-plus-installer";
const wikiPage = homePage + "/wiki";
const template = commands => [
  {
    label: "File",
    submenu: [
      { label: "Choose Game Folder", accelerator: "CmdOrCtrl+Shift+G", click: commands.chooseGameFolder },
      { label: "Choose Modlet Folder", accelerator: "CmdOrCtrl+Shift+M", click: commands.chooseModletFolder },
      { label: "Toggle Mode", accelerator: "CmdOrCtrl+Shift+T", click: commands.toggleMode },
      { type: "separator" },
      { role: "quit" }
    ]
  },
  { role: "editMenu" },
  {
    label: "View",
    submenu: [
      { label: "refresh modlets", accelerator: "CmdOrCtrl+R", click: commands.refreshModlets },
      { type: "separator" },
      { role: "resetzoom" },
      { role: "zoomin" },
      { role: "zoomout" },
      { type: "separator" },
      { role: "togglefullscreen" },
      { type: "separator" },
      { role: "toggledevtools" },
      { role: "forcereload" }
    ]
  },
  { role: "windowMenu" },
  {
    role: "Help",
    submenu: [
      aboutMenuItem({
        icon: iconPath,
        copyright: "Donovan C. Young",
        text: `Thanks for using the Valheim+ Installer.\n\nFor more information, please visit us at ${homePage}`
      }),
      {
        label: "Learn More",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal(wikiPage);
        }
      },
      {
        label: "Check for Updates",
        click: commands.checkUpdates.checkForUpdate,
        enabled: commands.checkUpdates.enabled
      }
    ]
  }
];

export default template;
