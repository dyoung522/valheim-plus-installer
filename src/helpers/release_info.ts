import { Octokit } from "@octokit/rest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (owner: string, repo: string, state: IState, stateDispatch: StateDispatch): Promise<any> {
  const octokit = new Octokit();

  return new Promise((resolve, reject) => {
    octokit.repos.listReleases({ owner, repo })
      .then(releases => {
        let found = false;

        releases.data.some(release => {
          if (release.name && release.name.search("STABLE") !== -1) {
            return release.assets.some(asset => {
              if (asset.name == state.downloadClientFilename) {
                found = true;
                resolve({ release: release, asset: asset });
              }
              return found;
            })
          }
        })
        if (!found) {
          stateDispatch({ type: "gotError", payload: "unable to find a suitable release file" });
          reject();
        }
      }).catch(err => stateDispatch({ type: "gotError", payload: ["We are unable to check for a new release at this time, please try again later.", err] }))
  });
  }
