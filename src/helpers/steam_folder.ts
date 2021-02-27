import path from "path";
import { spawn } from "child_process";
import { remote } from "electron";
import { fileExists } from "helpers";

export default function (): Promise<string> {
  const key = "HKLM\\SOFTWARE\\WOW6432NODE\\VALVE\\STEAM";
  const winDir = process.env.windir || "C:\\WINDOWS";
  const cmd = path.join(winDir, "system32", "reg.exe");

  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, ["QUERY", key, "/V", "INSTALLPATH"])

    proc.stdout.on('data', (data) => {
      const value = data.toString().match(/installpath\s+REG_SZ\s+(.*)$/mi);

      if (value && value.length > 1) {
        const gameDir = path.join(value[1], "steamapps", "common", "Valheim")

        if (fileExists(gameDir)) {
          resolve(gameDir);
        }
      }
    });

    proc.stderr.on('data', () => { reject("NO KEY FOUND") });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject("non-zero exit");
      }
    });
  })
}
