/* eslint-disable */
// @ts-ignore
interface IStore {
  gameFolder: string;
}

interface IState {
  config: any;
  currentID: number;
  currentTag: string;
  downloadClientFilename: string;
  downloadComplete: boolean;
  downloadPercent: number;
  error: string;
  gameFolder: string;
  installComplete: boolean;
  installed: boolean;
  releaseID: number;
  releasePath: string;
  releaseTag: string;
}

interface StateDispatch {
  (any: { type: string, payload?: any }): IState;
}
