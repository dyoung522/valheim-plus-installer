import React from "react";
import ConfigEditor from ".";
import { render } from "@testing-library/react";

it("renders without crashing", () => {
  const { asFragment } = render(
    <ConfigEditor />
  );

  expect(asFragment()).toMatchSnapshot();
});
