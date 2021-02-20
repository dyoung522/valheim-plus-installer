import React from "react";
import FolderPicker from ".";
import { render } from "@testing-library/react";

it("renders without crashing", () => {
  const { asFragment } = render(
    <FolderPicker folder={"/foo/bar"} handleClick={jest.fn()} label={"foo"} toolTip={"bar"} />
  );

  expect(asFragment()).toMatchSnapshot();
});
