import fs from "fs";

export default function saveConfig(state: IState, stateDispatch: StateDispatch): void {
  const configData = state.configNew;
  const configFile = state.modDir.config;

  const writeBuffer = (fd: fs.WriteStream, buffer: string) => {
    // console.log("writing ->", buffer);
    fd.write(buffer);
  }

  if (configData && configData.size && configFile) {
    console.info(`Writing CFG to ${configFile}`);

    const configFD = fs.createWriteStream(configFile);

    if (!configFD) {
      stateDispatch({ type: "gotError", payload: `Unable to open ${configFile} for writing` });
      return;
    }

    configFD.on("error", (err) => {
      stateDispatch({ type: "gotError", payload: `Error while writing to ${configFile}: ${err.toString()}` });
      return;
    });

    configFD.on("finish", () => {
      stateDispatch({ type: "setConfigDirty", payload: false });
      return;
    });

    Array.from(configData.keys()).forEach((section) => {
      if (section === "defaults") {
        return;
      }

      writeBuffer(configFD, `[${section}]\n\n`);

      const sectionData = configData.get(section);

      if (sectionData && sectionData.size) {
        Array.from(sectionData.keys()).forEach((option) => {
          const optionData = sectionData.get(option);

          if (optionData) {
            if (optionData.comment) {
              const comments = optionData.comment.split("\n");
              comments.forEach((comment) => writeBuffer(configFD, `; ${comment}\n`));
            }

            if (optionData.value) {
              writeBuffer(configFD, `${option}=${optionData.value.toString()}\n\n`)
            }
          }
        });
      }
    });
    configFD.end();
  } else {
    stateDispatch({ type: "gotError", payload: `Something went wrong trying to save ${configFile}` });
  }
}
