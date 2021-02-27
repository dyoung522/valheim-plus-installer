import fs from "fs";
import { fileExists } from "helpers";

export default function (fileName: string): Promise<string> {
  const noop = () => { null };

  return new Promise((resolve, reject) => {
    if (!fileExists(fileName)) {
      return resolve("Not Installed");
    }

    fs.open(fileName, 'r', (status, fd) => {
      if (status) {
        fs.close(fd, noop);
        return reject(new Error(status.toString()));
      }

      const buffer_size = fs.statSync(fileName).size
      const buffer = Buffer.alloc(buffer_size);

      fs.read(fd, buffer, 0, buffer_size, 0, (err, num): void => {
        const search_buffer = buffer.toString('utf8', 0, num);
        const search_string = "Valheim Plus";

        const index = search_buffer.search(search_string);

        if (index !== -1) {
          const start_index = index + search_string.length + 1;
          const end_index = search_buffer.slice(start_index, start_index + 10).search(/[^\d.]+/);

          if (end_index !== -1) {
            fs.close(fd, noop);
            return resolve(search_buffer.slice(start_index, start_index + end_index));
          }
        } else {
          fs.close(fd, noop);
          return reject(new Error("unable to find the current version in the DLL"));
        }
      });
    });
  });
}
