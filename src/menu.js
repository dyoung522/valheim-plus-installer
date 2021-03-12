/* eslint-disable */
// @ts-ignore
import path from "path";
import { aboutMenuItem } from "electron-util";
import { shell } from "electron";

const iconPath = path.join("public", "icon.png");
const homePage = "https://github.com/valheimPlus/ValheimPlus";
const template = commands => [
  {
    label: "File",
    submenu: [
      { label: "Choose Game Folder", accelerator: "CmdOrCtrl+Shift+G", click: commands.chooseGameFolder },
      { label: "Check for V+ Updates", accelerator: "CmdOrCtrl+Shift+U", click: commands.checkForModUpdate },
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
        text: "Thanks for using the Valheim+ Installer and CFG editor."
      }),
      {
        label: "Learn More",
        click: async () => {
          await shell.openExternal(homePage);
        }
      },
      {
        label: "Check for App Updates",
        click: commands.checkUpdates.checkForUpdate,
        enabled: commands.checkUpdates.enabled
      }
    ]
  }
];

export default template;
