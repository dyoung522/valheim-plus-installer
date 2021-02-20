import { useReducer } from "react";

const defaultState: IState = {
  config: null,
  gameFolder: ""
};

function initialState(config: any): IState {
  const gameFolder = config.get("gameFolder");

  return {
    config,
    gameFolder
  };
}

function reducer(state: IState, action: { type: string; payload?: any }): IState {
  console.info("Received dispatch:", action);

  switch (action.type) {
    case "setGameFolder": {
      state.config.set("gameFolder", action.payload);
      return {
        ...state,
        gameFolder: action.payload
      };
    }

    case "clearGameFolder": {
      return {
        ...state,
        gameFolder: ""
      };
    }

    default:
      return state;
  }
}

export default (config: any) => useReducer(reducer, defaultState, () => initialState(config));
