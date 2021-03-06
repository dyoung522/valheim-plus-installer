/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReducer } from "react";
import { fileExists } from "helpers";
import path from "path";

const defaultState: IState = {
  config: null,
  configCurrent: new Map(),
  configDirty: false,
  configNew: new Map(),
  currentID: 0,
  currentTag: "Not Installed",
  downloadComplete: false,
  downloadPercent: 0.0,
  downloadClientFilename: "WindowsClient.zip",
  error: "",
  gameFolder: undefined,
  installComplete: false,
  installed: false,
  modDir: { base: undefined, config: undefined, dll: undefined },
  releaseID: 0,
  releasePath: "",
  releaseTag: "",
};

function setModDir(baseDir: string | undefined): IModDirs {
  if (baseDir && fileExists(baseDir)) {
    const modDir = path.join(baseDir, "BepInEx");

    return {
      base: modDir,
      config: path.join(modDir, 'config', "valheim_plus.cfg"),
      dll: path.join(modDir, "plugins", "ValheimPlus.dll")
    }
  } else {
    return { base: undefined, config: undefined, dll: undefined }
  }
}

function initialState(config: any): IState {
  const configCurrent = defaultState.configCurrent;
  const configDirty = defaultState.configDirty;
  const configNew = defaultState.configNew;
  const currentID = defaultState.currentID;
  const currentTag = defaultState.currentTag;
  const downloadClientFilename = defaultState.downloadClientFilename;
  const downloadComplete = defaultState.downloadComplete;
  const downloadPercent = defaultState.downloadPercent;
  const error = defaultState.error;
  const installComplete = defaultState.installComplete;
  const installed = defaultState.installed;
  const gameFolder = config.get("gameFolder");
  let modDir = defaultState.modDir;
  const releaseID = config.get("releaseID") || defaultState.releaseID;
  const releasePath = defaultState.releasePath;
  const releaseTag = config.get("releaseTag") || defaultState.releaseTag;

  if (gameFolder) {
    modDir = setModDir(gameFolder);
  }

  return {
    config,
    configCurrent,
    configDirty,
    configNew,
    currentID,
    currentTag,
    downloadClientFilename,
    downloadComplete,
    downloadPercent,
    error,
    installComplete,
    installed,
    gameFolder,
    modDir,
    releaseID,
    releasePath,
    releaseTag
  };
}

function reducer(state: IState, action: { type: string; payload?: any }): IState {
  console.info("Received dispatch:", action);

  switch (action.type) {
    case "setGameFolder": {
      state.config.set("gameFolder", action.payload);

      return {
        ...state,
        currentID: defaultState.currentID,
        currentTag: defaultState.currentTag,
        gameFolder: action.payload,
        installComplete: false,
        installed: false,
        modDir: setModDir(action.payload)
      };
    }

    case "clearGameFolder":
      return {
        ...state,
        gameFolder: "",
        installComplete: false,
        installed: false,
        modDir: setModDir(undefined)
      };

    case "updateRelease": {
      state.config.set("releaseID", action.payload.id);
      state.config.set("releaseTag", action.payload.tag);

      return {
        ...state,
        releaseID: action.payload.id,
        releaseTag: action.payload.tag,
        releasePath: action.payload.url
      }
    }

    case "updateCurrentID": {
      return {
        ...state,
        currentID: action.payload
      }
    }

    case "updateCurrentTag": {
      return {
        ...state,
        currentTag: action.payload
      }
    }

    case "modInstalled":
      return {
        ...state,
        installed: true
      }

    case "downloadComplete":
      return {
        ...state,
        downloadComplete: true
      }

    case "downloadPercent":
      return {
        ...state,
        downloadPercent: action.payload
      }

    case "installComplete":
      return {
        ...state,
        installComplete: true,
        installed: true
      }

    case "setConfigCurrent":
      return {
        ...state,
        configCurrent: action.payload,
        configDirty: false,
      }

    case "setConfigDirty":
      return {
        ...state,
        configDirty: action.payload
      }

    case "setConfigNew":
      return {
        ...state,
        configNew: action.payload
      }

    case "gotError": {
      console.error(action.payload);
      return {
        ...state,
        error: action.payload
      }
    }

    default:
      return state;
  }
}

export default (config: IState): any => useReducer(reducer, defaultState, () => initialState(config));
