/* eslint-disable */
// @ts-ignore
type IConfigOption = { value: string, comment: string }
type IConfig = Map<string, Map<string, IConfigOption>>
type IModDirs = { base: string | undefined, config: string | undefined, dll: string | undefined };

interface IStore {
  gameFolder: string;
}

interface IState {
  config: any;
  configCurrent: IConfig;
  configDirty: boolean;
  configNew: IConfig;
  currentID: number;
  currentTag: string;
  downloadClientFilename: string;
  downloadComplete: boolean;
  downloadPercent: number;
  error: string;
  gameFolder: string | undefined;
  installComplete: boolean;
  installed: boolean;
  modDir: IModDirs;
  releaseID: number;
  releasePath: string;
  releaseTag: string;
}

interface StateDispatch {
  (any: { type: string, payload?: any }): IState;
}
