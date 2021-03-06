import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Fab from "@material-ui/core/Fab";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import LaunchIcon from "@material-ui/icons/Launch";
import SaveIcon from "@material-ui/icons/Save";
import { execFile } from "child_process";
import FolderPicker from "components/FolderPicker";
import Installer from "components/Installer";
import { remote, ipcRenderer } from "electron";
import theme from "helpers/theme";
import path from "path";
import React, { useEffect, useState } from "react";
import { hot } from "react-hot-loader";
import menuTemplate from "./menu";
import Typography from "@material-ui/core/Typography";
import { ConfigFile, fileExists, getSteamFolder, getVersion, readSem, saveConfig } from "helpers";
import isDev from "electron-is-dev";
import ConfigEditor from "components/ConfigEditor";
import LoadingPage from "components/LoadingPage";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "lightgray",
  },
  bodyContainer: {
    marginTop: 10,
    overflowY: "auto",
    height: "100%",
  },
  footerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.palette.background.paper,
    borderTop: "1px solid silver",
  },
  controlsContainer: {
    display: "flex",
    flexFlow: "row nowrap",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "5px",
    padding: theme.spacing(1),
    textAlign: "center",
  },
  modeControl: {
    padding: theme.spacing(1),
  },
  noGameTitle: {
    color: "red",
    fontSize: 24,
    padding: theme.spacing(1),
  },
  noGameFolder: {
    display: "block",
    margin: "auto",
    marginTop: theme.spacing(4),
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    padding: theme.spacing(1),
    textAlign: "left",
  },
  launchButton: {
    margin: theme.spacing(1),
    width: 250,
  },
  launchIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.secondary.main,
  },
  footer: {
    margin: theme.spacing(1),
  },
}));

interface AppProps {
  state: IState;
  stateDispatch: StateDispatch;
}

function App({ state, stateDispatch }: AppProps): React.ReactElement {
  const classes = useStyles();
  const gameExecutable = "valheim.exe";
  const gameLabel = "Valheim+";
  const [loading, setLoading] = useState(false);
  const [appUpdating, setAppUpdating] = useState(false);
  const [appUpdated, setAppUpdated] = useState(false);
  const [modInstalled, setModInstalled] = useState(false);

  let pageRender = null;

  const confirmInstallation = () => setModInstalled(true);

  const checkForUpdate = (fromMenu?: boolean) => {
    ipcRenderer.on("updateComplete", () => {
      setAppUpdating(false);
    });

    if (!appUpdating) {
      ipcRenderer.send("checkForUpdate", fromMenu || false);
      setAppUpdating(true);
    }
  };

  const errorDialog = (title: string, err: Error) => {
    remote.dialog.showMessageBox({
      type: "error",
      title: title,
      message: err.message,
    });
  };

  const launchGame = () => {
    if (state.configDirty) {
      saveConfig(state, stateDispatch);
    } else {
      if (state.gameFolder) {
        const game = path.normalize(path.join(state.gameFolder, gameExecutable));

        if (fileExists(game)) {
          execFile(game, (err) => {
            if (err) {
              errorDialog(`Unable to start ${gameLabel}`, err);
              return;
            }
          });
        }
      }
    }
  };

  const checkGameFolder = async (): Promise<void> => {
    setLoading(true);
    if (!state.gameFolder || !fileExists(state.gameFolder)) {
      await getSteamFolder()
        .then((folder) => stateDispatch({ type: "setGameFolder", payload: folder }))
        .catch((err) => console.error(err));
    }
    setLoading(false);
  };

  const getConfigCurrent = async () => {
    if (state.modDir.config && fileExists(state.modDir.config)) {
      const configData = await new ConfigFile(state.modDir.config).data();
      stateDispatch({ type: "setConfigCurrent", payload: configData });
    }
  };

  const getGameInfo = async () => {
    setLoading(true);
    if (state.gameFolder && fileExists(state.gameFolder) && state.modDir.dll && state.modDir.config) {
      console.info("loading mod data");
      if (fileExists(state.modDir.dll) && fileExists(state.modDir.config)) {
        setLoading(true);
        readSem(state, stateDispatch);

        await getVersion(state.modDir.dll)
          .then((version) => stateDispatch({ type: "updateCurrentTag", payload: version }))
          .catch((error) => stateDispatch({ type: "gotError", payload: error.toString() }));

        stateDispatch({ type: "modInstalled" });
      }
    }
    setLoading(false);
  };

  const getFolder = async (title: string) => {
    const dialog = await remote.dialog.showOpenDialog({
      title: title,
      defaultPath: state.gameFolder,
      properties: ["openDirectory"],
    });

    if (!dialog.canceled) return dialog.filePaths[0];

    return null;
  };

  const getGameFolder = () => {
    getFolder(`Please select the ${gameLabel} game folder`)
      .then((newFolder) => {
        if (newFolder) {
          if (fileExists(path.join(newFolder, gameExecutable))) {
            stateDispatch({ type: "setGameFolder", payload: newFolder });
            setModInstalled(false);
          } else {
            errorDialog("Invalid Game Folder", new Error(`The chosen folder is not a valid ${gameLabel} game folder`));
          }
        }
    });
  };

  // Runs when the gameFolder changes or a new version is installed
  useEffect(() => {
    checkGameFolder();
    getGameInfo();
  }, [state.installComplete, state.gameFolder]);

  // Only runs when the gameFolder changes (i.e. on start or when a new folder is chosen)
  useEffect(() => {
    getConfigCurrent();
  }, [state.gameFolder]);

  // Check for updates after launch
  useEffect(() => {
    if (!appUpdated && !appUpdating) {
      setTimeout(() => {
        try {
          checkForUpdate();
          setAppUpdated(true);
        } catch {
          stateDispatch({ type: "gotError", payload: `Unable to auto-update ${gameLabel} installer` });
        }
      }, 5000);
    }
  }, [appUpdated, appUpdating])

  if (loading) {
    pageRender = <LoadingPage />;
  } else {
    if (state.config === undefined || !state.gameFolder) {
      pageRender = (
        <React.Fragment>
          <Box boxShadow={1} className={classes.controlsContainer}>
            <Box>
              <Typography className={classes.noGameTitle}>No Valheim installation folder found</Typography>
              <Typography className={classes.errorText}>
                We were unable to automatically determine the Valhiem game folder.
              </Typography>
              <Typography className={classes.errorText}>
                Please click the button below and select it from the dialog box or, if you haven&apos;t yet installed
                the game, please exit this program and do so first.
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" color="secondary" onClick={getGameFolder} className={classes.noGameFolder}>
            Please Select the {gameLabel} game folder to continue.
          </Button>
        </React.Fragment>
      );
    }
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
  const template: any = menuTemplate({
    checkUpdates: {
      checkForUpdate: () => checkForUpdate(true),
      enabled: !(isDev || appUpdating),
    },
    chooseGameFolder: getGameFolder,
    isDev: isDev,
  });

  remote.Menu.setApplicationMenu(remote.Menu.buildFromTemplate(template));


  if (!pageRender) {
    let launchButton: JSX.Element;

    if (state.configDirty) {
      launchButton = (
        <>
          <SaveIcon className={classes.launchIcon} />
          Save CFG
        </>
      )
    } else {
      launchButton = (
        <>
          <LaunchIcon className={classes.launchIcon} />
          Launch {gameLabel}
        </>
      )
    }

    pageRender = (
      <React.Fragment>
        <Box boxShadow={1} className={classes.controlsContainer}>
          <FolderPicker
            folder={state.gameFolder || ""}
            handleClick={getGameFolder}
            label="Game Folder"
            toolTip="Click to select Game Folder"
          />
          {state.installed && (
            <Fab
              variant="extended"
              size="large"
              color="primary"
              aria-label="Launch ${gameLabel}"
              className={classes.launchButton}
              onClick={launchGame}
            >
              {launchButton}
            </Fab>
          )}
        </Box>
        {state.installed && modInstalled ? (
          <ConfigEditor state={state} stateDispatch={stateDispatch} />
        ) : (
          <Installer state={state} stateDispatch={stateDispatch} confirmInstallation={confirmInstallation} />
        )}
      </React.Fragment>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={classes.mainContainer}>
        <Container maxWidth="xl" className={classes.bodyContainer}>
          {pageRender}
        </Container>
        <Box className={classes.footerContainer}>
          <Typography className={classes.footer} component="div">
            {remote.app.name} v.{remote.app.getVersion()}
          </Typography>
          <Typography className={classes.footer} component="div">
            {state.installed && state.releaseID === state.currentID && "No updates at this time"}
          </Typography>
          <Typography className={classes.footer} component="div">
            Valheim+ {state.currentTag === "Not Installed" ? "is " : "v."}
            {state.currentTag}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default hot(module)(App);
