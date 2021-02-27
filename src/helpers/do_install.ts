import path from "path";
import fs from "fs";
import { ipcRenderer } from "electron";
import { fileExists } from "helpers";
import { remote } from "electron";

function unzip(filename: string, state: IState, stateDispatch: StateDispatch): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const DecompressZip = require("decompress-zip");
  const unzipper = new DecompressZip(filename)

  return new Promise((resolve, reject) => {
    unzipper.on("error", (err: string) => { reject(err) });
    unzipper.on("extract", () => { resolve(null) });

    // unzipper.on("progress", (fileIndex: number, fileCount: number) => {
    //   console.log("Extracted file " + (fileIndex + 1) + " of " + fileCount);
    // });

    unzipper.extract({
      path: state.gameFolder,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter: (file: any) => {
        return file.type !== "SymbolicLink";
      }
    });
  })
}

export default function (state: IState, stateDispatch: StateDispatch): void {
  if (!(state.releasePath && state.releasePath.length > 0)) { return }

  const clientFilename = `valheim_plus_windows_client-${state.releaseTag}.zip`
  const archiveFile = path.join(remote.app.getPath("downloads"), clientFilename);

  // Remove any existing downloads
  if (archiveFile && fileExists(archiveFile)) {
    console.info(`An older installation archive was found at ${archiveFile}, removing it.`)
    try {
      fs.unlinkSync(archiveFile)
    } catch (error) {
      stateDispatch({ type: "gotError", payload: `Unable to delete ${archiveFile} due to: ${error}` })
      return;
    }
  }

  ipcRenderer.on("download complete", (_event, file) => {
    console.info("download has completed for", file)
    stateDispatch({ type: "downloadComplete", payload: file });

    // do install here
    unzip(file, state, stateDispatch)
      .then(() => { stateDispatch({ type: "installComplete" }) })
      .catch((err) => { stateDispatch({ type: "gotError", payload: err }) });
  })

  // ipcRenderer.on("download progress", (_event, progress) => {
  //   stateDispatch({ type: "downloadPercent", payload: Math.floor(progress.percent * 100) });
  // });

  ipcRenderer.on("download error", (error) => {
    stateDispatch({ type: "gotError", payload: error });
  });

  ipcRenderer.send("download", { url: state.releasePath, properties: { filename: clientFilename } });
}
