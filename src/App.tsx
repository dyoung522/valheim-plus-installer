import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Fab from "@material-ui/core/Fab";
import List from "@material-ui/core/List";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import LaunchIcon from "@material-ui/icons/Launch";
import { execFile } from "child_process";
import FolderPicker from "components/FolderPicker";
import { remote, ipcRenderer } from "electron";
import theme from "helpers/theme";
import path from "path";
import React, { useCallback, useEffect, useState } from "react";
import { hot } from "react-hot-loader";
import menuTemplate from "./menu";
import Typography from "@material-ui/core/Typography";
import { fileExists } from "helpers";
import isDev from "electron-is-dev";

const useStyles = makeStyles(theme => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh"
  },
  bodyContainer: {
    marginTop: 10,
    overflowY: "auto",
    height: "100%"
  },
  footerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.palette.background.paper,
    borderTop: "1px solid silver"
  },
  controlsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center"
  },
  modeControl: {
    padding: theme.spacing(1)
  },
  noGameFolder: {
    display: "block",
    margin: "auto",
    marginTop: 200,
    textAlign: "center"
  },
  noGameFolderIcon: {
    display: "block",
    margin: "auto",
    marginTop: 25
  },
  launchButton: {
    margin: theme.spacing(1)
  },
  launchIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.secondary.main
  },
  footer: {
    margin: theme.spacing(1)
  }
}));

interface AppProps {
  state: IState;
  stateDispatch: (action: { type: string; payload?: any }) => IState;
}

function App({ state, stateDispatch }: AppProps): React.ReactElement {
  const classes = useStyles();
  const gameExecutable = "valheim.exe";
  const [loading, setLoading] = useState(false);
  const [appUpdating, setAppUpdating] = useState(false);
  const [appUpdated, setAppUpdated] = useState(false);

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
      message: err.message
    });
  };

  const launchGame = () => {
    const game = path.normalize(path.join(state.gameFolder, gameExecutable));

    if (fileExists(game))
      execFile(game, err => {
        if (err) {
          errorDialog("Unable to start Valheim", err);
          return;
        }
      });
  };

  const getFolder = async (title: string) => {
    setLoading(true);

    const dialog = await remote.dialog.showOpenDialog({
      title: title,
      properties: ["openDirectory"]
    });

    setLoading(false);

    if (!dialog.canceled) return dialog.filePaths[0];

    return null;
  };

  const getGameFolder = useCallback(() => {
    getFolder('Please select the "Valheim" game folder').then(newFolder => {
      if (newFolder) {
        if (fileExists(path.join(newFolder, gameExecutable))) {
          stateDispatch({ type: "setGameFolder", payload: newFolder });
        } else {
          errorDialog("Invalid Game Folder", new Error("The chosen folder is not a valid Valheim game folder"));
        }
      }
    });
  }, [stateDispatch]);

  // Check for invalid gameFolder
  useEffect(() => {
    if (state.gameFolder && !fileExists(state.gameFolder)) stateDispatch({ type: "clearGameFolder" });
  }, [stateDispatch, state.gameFolder]);

  // Check for empty gameFolder
  useEffect(() => {
    if (!state.gameFolder) getGameFolder();
  }, [state.gameFolder, getGameFolder]);

  if (!loading && (state.config === undefined || !state.gameFolder)) {
    return (
      <Button variant="contained" color="secondary" onClick={getGameFolder} className={classes.noGameFolder}>
        Please Select the Valheim game folder to continue.
      </Button>
    );
  }

  if (loading && !state.gameFolder) {
    return (
      <Box>
        <Typography variant="h5" className={classes.noGameFolder}>
          Waiting for Selection
        </Typography>
        <CircularProgress className={classes.noGameFolderIcon} />
      </Box>
    );
  }

  const commands = {
    checkUpdates: {
      checkForUpdate: () => checkForUpdate(true),
      enabled: !(isDev || appUpdating)
    },
    chooseGameFolder: getGameFolder
  };

  // @ts-ignore
  remote.Menu.setApplicationMenu(remote.Menu.buildFromTemplate(menuTemplate(commands)));

  // Check for updates after launch
  if (!appUpdated && !appUpdating) {
    setTimeout(() => {
      checkForUpdate();
      setAppUpdated(true);
    }, 5000);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={classes.mainContainer}>
        <Container maxWidth="xl" className={classes.bodyContainer}>
          <Box className={classes.controlsContainer}>
            <Fab
              variant="extended"
              size="medium"
              color="primary"
              aria-label="Launch Valheim"
              className={classes.launchButton}
              onClick={launchGame}
            >
              <LaunchIcon className={classes.launchIcon} />
              Play Game
            </Fab>
          </Box>
          <List dense={true}>
            <FolderPicker
              folder={state.gameFolder}
              handleClick={getGameFolder}
              label="Game Folder"
              toolTip="Click to select Game Folder"
            />
          </List>
        </Container>
        <Box className={classes.footerContainer}>
          <Typography className={classes.footer} component="div">
            {remote.app.name}
          </Typography>
          <Typography className={classes.footer} component="div">
            Version v.{remote.app.getVersion()}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default hot(module)(App);
