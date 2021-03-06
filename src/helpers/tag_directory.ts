import fs from "fs";
import path from "path";
import fileExists from "./file_exists";

function getSemFile(modFolder: string): string {
  return (path.join(modFolder, "config", ".valheim.version"));
}

export function writeSem(state: IState, stateDispatch: StateDispatch): void {
  if (!state.modDir.base) {
    return;
  }

  fs.writeFile(getSemFile(state.modDir.base), state.releaseID.toString(), "utf8", (error) => {
    if (error) {
      stateDispatch({ type: "gotError", payload: error.toString() });
    }
  });
}

export function readSem(state: IState, stateDispatch: StateDispatch): void {
  if (!state.modDir.base) {
    return;
  }

  const semFile = getSemFile(state.modDir.base);

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
