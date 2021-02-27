/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReducer } from "react";

const defaultState: IState = {
  config: null,
  currentID: 0,
  currentTag: "Not Installed",
  downloadComplete: false,
  downloadPercent: 0.0,
  downloadClientFilename: "WindowsClient.zip",
  error: "",
  gameFolder: "",
  installComplete: false,
  installed: false,
  releaseID: 0,
  releasePath: "",
  releaseTag: ""
};

function initialState(config: any): IState {
  const currentID = defaultState.currentID;
  const currentTag = defaultState.currentTag;
  const downloadClientFilename = defaultState.downloadClientFilename;
  const downloadComplete = defaultState.downloadComplete;
  const downloadPercent = defaultState.downloadPercent;
  const error = defaultState.error;
  const installComplete = defaultState.installComplete;
  const installed = defaultState.installed;
  const gameFolder = config.get("gameFolder");
  const releaseID = config.get("releaseID") || defaultState.releaseID;
  const releasePath = defaultState.releasePath;
  const releaseTag = config.get("releaseTag") || defaultState.releaseTag;

  return {
    config,
    currentID,
    currentTag,
    downloadClientFilename,
    downloadComplete,
    downloadPercent,
    error,
    installComplete,
    installed,
    gameFolder,
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
        gameFolder: action.payload,
        currentID: defaultState.currentID,
        currentTag: defaultState.currentTag,
        installed: false
      };
    }

    case "clearGameFolder":
      return {
        ...state,
        gameFolder: "",
        installed: false
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
