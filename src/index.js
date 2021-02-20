import Store from "electron-store";
import unhandled from "electron-unhandled";
import React from "react";
import ReactDOM from "react-dom";
import stateReducer from "helpers/state";
import App from "./App";

unhandled();

function State() {
  const config = new Store({ name: "valheim+" });
  const [state, stateDispatch] = stateReducer(config);

  return <App state={state} stateDispatch={stateDispatch} />;
}

ReactDOM.render(<State />, document.getElementById("root"));
