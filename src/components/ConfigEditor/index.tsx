import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import { ConfigFile, fileExists } from "helpers";
import LoadingPage from "components/LoadingPage";
import ConfigSection from "components/ConfigSection";

interface ConfigEditorProps {
  state: IState;
  stateDispatch: StateDispatch;
}

const useStyles = makeStyles((theme) => ({
  configContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  card: {
    display: "flex",
    flexFlow: "row wrap",
    justifyContent: "center",
    width: 500,
    margin: theme.spacing(1),
    marginLeft: "auto",
    marginRight: "auto",
    padding: theme.spacing(4),
  },
  quitMessage: {
    marginTop: 15,
  },
}));

function ConfigEditor(props: ConfigEditorProps): React.ReactElement {
  const { state, stateDispatch } = props;
  const classes = useStyles();
  const [configNew, setConfigNew] = useState(new Map());
  const [loading, setLoading] = useState(true);

  const updateConfig = () => stateDispatch({ type: "setConfigNew", payload: configNew });

  if (state.modDir.config && !fileExists(state.modDir.config)) {
    throw new Error("Config does not exist");
  }

  const configFile = new ConfigFile(state.modDir.config || "");

  useEffect(() => {
    (async () => {
      const data = await configFile.data();
      setConfigNew(data);
    })();
  }, []);

  useEffect(() => {
    if (configNew.size) {
      // TODO highlight entries that exist in the new config but not the old one
      Array.from(configNew.keys()).forEach((section: string) => {
        const currentSection: Map<string, IConfigOption> | undefined = configNew.get(section);
        const previousSection: Map<string, IConfigOption> | undefined = state.configCurrent.get(section);

        if (previousSection) {
          if (currentSection) {
            Array.from(currentSection.keys()).forEach((option: string) => {
              const currentOption: IConfigOption | undefined = currentSection.get(option);
              const previousOption: IConfigOption | undefined = state.configCurrent.get(section)?.get(option);

              if (previousOption) {
                if (currentOption && previousOption.value !== currentOption.value) {
                  currentOption.value = previousOption.value;
                  configNew.get(section)?.set(option, currentOption);
                  if (!state.configDirty) {
                    stateDispatch({ type: "setConfigDirty", payload: true });
                  }
                }
              } else {
                // New option in current section
              }
            });
          }
        } else {
          // Completely new section
        }
      });
      updateConfig();
      setLoading(false);
    }
  }, [configNew]);

  if (loading) {
    return <LoadingPage />;
  } else {
    const configSections = Array.from(configNew.keys()).map((section) => {
      if (section == "defaults") {
        return;
      }

      return (
        <ConfigSection
          key={section}
          configData={configNew.get(section) || new Map()}
          section={section}
          state={state}
          stateDispatch={stateDispatch}
          updateConfig={updateConfig} />
      )
    });

    return <Box className={classes.configContainer}>{configSections}</Box>;
  }
}

ConfigEditor.propTypes = {
  state: PropTypes.object.isRequired,
  stateDispatch: PropTypes.func.isRequired,
};

export default ConfigEditor;
