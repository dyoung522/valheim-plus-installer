import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import getReleaseInfo from "helpers/release_info";
import { doInstall, writeSem } from "helpers";

interface InstallerProps {
  state: IState;
  stateDispatch: StateDispatch;
  confirmInstallation: () => void;
}

const useStyles = makeStyles((theme) => ({
  logWindow: {
    margin: theme.spacing(5),
    padding: theme.spacing(1),
    backgroundColor: "white",
    borderRadius: 5,
  },
}));

function Installer(props: InstallerProps): React.ReactElement {
  const { state, stateDispatch, confirmInstallation } = props;
  const classes = useStyles();
  const [messageLog, setMessageLog] = useState(["Welcome to the Valheim+ Installer"]);
  const [installing, setInstalling] = useState(false);
  const [update, setUpdate] = useState("unknown");

  const addMessageLog = (log: string) => messageLog.push(log);
  const haveRelease = state.releasePath && state.releasePath.length > 0;

  useEffect(() => {
    getReleaseInfo("ValheimPlus", "ValheimPlus", state, stateDispatch).then((data) => {
      if (data) {
        stateDispatch({
          type: "updateRelease",
          payload: { id: data.release.id, tag: data.release.tag_name, url: data.asset.browser_download_url },
        });
      }
    });
  }, []);

  useEffect(() => {
    if (state.releaseID === state.currentID && update != "complete") {
      confirmInstallation();
    }
  }, [update, state.releaseID, state.currentID]);

  useEffect(() => {
    if (state.installComplete) {
      return;
    }

    if (state.releaseID !== 0 && state.releaseTag && state.releaseTag.length > 0) {
      if (state.releaseID !== state.currentID) {
        if (state.installed) {
          setMessageLog(["Checking for updates..."]);
          if (state.currentTag === state.releaseTag) {
            setMessageLog([
              `It looks like you have version ${state.currentTag} installed, but we couldn't determine if this is the latest release.`,
              "Clicking install below will ensure you have the latest version.",
            ]);
          } else {
            setMessageLog([`An update was found ${state.currentTag} -> ${state.releaseTag}`]);
          }
        }
        addMessageLog(`Ready to Install v.${state.releaseTag}`);
        setUpdate("ready");
      }
    }
  }, [state.releaseID, state.releaseTag, state.currentID, state.currentTag]);

  useEffect(() => {
    if (state.error) {
      addMessageLog(Array.isArray(state.error) ? state.error.join(": ") : state.error);
      setUpdate("error");
    }
  }, [state.error]);

  useEffect(() => {
    if (!state.error && state.installComplete) {
      writeSem(state, stateDispatch);
      addMessageLog("Installation Complete");
      setUpdate("complete");
      setInstalling(false);
    }
  }, [state.installComplete]);

  const updateHandler = () => {
    if (haveRelease) {
      addMessageLog(`Installing Valheim+ v.${state.releaseTag}...`);
      setInstalling(true);
      doInstall(state, stateDispatch);
    }
  };

  const button = (update: string) => {
    if (update == "ready") {
      return (
        <ButtonGroup variant="contained">
          <Button variant="contained" color="primary" onClick={updateHandler} disabled={installing}>
            Install
          </Button>
          {state.installed && (
            <Button variant="contained" color="secondary" onClick={confirmInstallation}>
              Skip
            </Button>
          )}
        </ButtonGroup>
      );
    }

    return (
      <Button variant="contained" color="primary" onClick={confirmInstallation}>
        OK
      </Button>
    );
  };

  let i = 0;
  const log = messageLog.map((line) => (
    <ListItem key={i++}>
      <ListItemText primary={line} />
    </ListItem>
  ));

  return (
    <Box boxShadow={1} className={classes.logWindow}>
      <Box fontWeight="fontWeightBold" fontSize={16}>
        Install Log
      </Box>
      <List>{log}</List>
      <Box>
        {button(update)}
      </Box>
    </Box>
  )
}

export default Installer;
