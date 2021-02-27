import React from "react";
import Installer from ".";
import mock_state from "test_helpers/mock_state";
import { render } from "@testing-library/react";

it("renders without crashing", () => {
  const { asFragment } = render(
    <Installer state={mock_state} stateDispatch={jest.fn()} confirmInstallation={jest.fn()} />
  );

  expect(asFragment()).toMatchSnapshot();
});
