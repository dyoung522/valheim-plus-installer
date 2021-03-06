import fs from "fs";
import fileExists from "./file_exists";

function parseINI(data: string): IConfig {
  const regex = {
    section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
    option: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
    comment: /^\s*;\s*(.*)\s*$/
  };

  const lines: string[] = data.split(/[\r\n]+/);
  const values: IConfig = new Map();

  let sectionKey = "defaults";
  let comment: string[] = [];

  values.set(sectionKey, new Map());

  lines.forEach((line) => {
    if (regex.comment.test(line)) {
      const match = line.match(regex.comment);
      if (match && match.length > 1 && match[1]) {
        comment.push(match[1]);
      }
      return;
    }

    if (regex.section.test(line)) {
      const match = line.match(regex.section);
      if (match && match.length > 1 && match[1]) {
        sectionKey = match[1];
        values.set(sectionKey, new Map());
      }
      comment = [];
      return;
    }

    if (regex.option.test(line)) {
      const match = line.match(regex.option);

      if (match && match.length > 2 && match[1] && match[2]) {
        const key: string = match[1];
        const value: string = match[2];
        const section = values.get(sectionKey);

        if (section) {
          section.set(key, { value: value, comment: comment.join("\n") || "" })
        }
      }
    }
    comment = [];
  })

  return values;
}

export default class ConfigFile {
  configFile: string;
  configData: Promise<string>;

  constructor(configFile: string) {
    if (!fileExists(configFile)) {
      throw new Error("gameFolder is not valid");
    }

    this.configFile = configFile;

    if (!fileExists(this.configFile)) {
      throw new Error(`unable to read ${this.configFile}`)
    }

    this.configData = fs.promises.readFile(this.configFile, "utf8");
  }

  async data(): Promise<IConfig> {
    try {
      return parseINI(await this.configData);
    } catch (err) {
      throw new Error(err);
    }
  }

  // write the CFG file, return boolean
  write(): boolean {
    return true;
  }
}
