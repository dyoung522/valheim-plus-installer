import App from "App";
import React from "react";
import mock_store from "test_helpers/mock_store";
import mock_state from "test_helpers/mock_state";
import { render } from "@testing-library/react";

jest.mock("electron", () => ({
  remote: {
    app: {
      name: "Valheim+ Installer TEST",
      getVersion: jest.fn(() => "0.0.1")
    },
    Menu: {
      buildFromTemplate: jest.fn(),
      setApplicationMenu: jest.fn()
    },
    dialog: {
      showOpenDialog: jest.fn(() => ({
        canceled: true,
        filePaths: [mock_store.store.gameFolder]
      }))
    }
  }
}));

jest.mock("electron-util", () => ({
  aboutMenuItem: jest.fn()
}));

it("renders without crashing", () => {
  const { asFragment } = render(<App state={mock_state} stateDispatch={jest.fn()} />);

  expect(asFragment()).toMatchSnapshot();
});
