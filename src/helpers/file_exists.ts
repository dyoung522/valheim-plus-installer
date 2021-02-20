import fs from "fs";

export default function(filePath: string): boolean {
  try {
    fs.accessSync(filePath);
  } catch {
    return false;
  }
  return true;
}
