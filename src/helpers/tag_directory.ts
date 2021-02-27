import fs from "fs";
import path from "path";
import fileExists from "./file_exists";

function getSemFile(gameFolder: string): string {
  return (path.join(gameFolder, "BepInEx", "config", ".valheim.version"));
}

export function writeSem(state: IState, stateDispatch: StateDispatch): any {
  fs.writeFile(getSemFile(state.gameFolder), state.releaseID.toString(), "utf8", (error) => {
    if (error) {
      stateDispatch({ type: "gotError", payload: error.toString() });
    }
  });
}

export function readSem(state: IState, stateDispatch: StateDispatch): any {
  const semFile = getSemFile(state.gameFolder);

  if (fileExists(semFile)) {
    fs.readFile(semFile, (error, data) => {
      if (error) {
        stateDispatch({ type: "gotError", payload: error.toString() });
      } else {
        stateDispatch({ type: "updateCurrentID", payload: parseInt(data.toString()) });
      }
    });
  }
}
