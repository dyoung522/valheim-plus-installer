import fileExists from "./file_exists";

it("should return true when a file exists", () => {
  expect(fileExists(__filename)).toBe(true);
});

it("should return false when the file does not exist", () => {
  expect(fileExists("/foo/bar/bat")).toBe(false);
});
