import path from "path";
import { aboutMenuItem } from "electron-util";
import { shell } from "electron";

const iconPath = path.join("public", "favicon.ico");
const homePage = "https://github.com/dyoung522/valheim-plus-installer";
const wikiPage = homePage + "/wiki";
const template = commands => [
  {
    label: "File",
    submenu: [
      { label: "Choose Game Folder", accelerator: "CmdOrCtrl+Shift+G", click: commands.chooseGameFolder },
      { type: "separator" },
      { role: "quit" }
    ]
  },
  { role: "editMenu" },
  {
    label: "View",
    submenu: [
      { role: "resetzoom" },
      { role: "zoomin" },
      { role: "zoomout" },
      { type: "separator" },
      { role: "togglefullscreen" },
      commands.isDev ? { role: "toggledevtools" } : { type: "separator" },
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
