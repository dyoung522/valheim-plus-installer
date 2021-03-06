import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import Fade from "@material-ui/core/Fade";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import FormGroup from "@material-ui/core/FormGroup";
import FormControl from "@material-ui/core/FormControl";
import Switch from "@material-ui/core/Switch";
import InputBase from "@material-ui/core/InputBase";

interface ConfigOptionProps {
  configData: Map<string, IConfigOption>;
  optionKey: string;
  state: IState;
  stateDispatch: StateDispatch;
  toggleSection: (state: boolean) => void;
  updateConfig: () => void;
}

const useStyles = makeStyles((theme) => ({
  options: {
    display: "flex",
    flexFlow: "row wrap",
    justifyContent: "space-between",
    padding: theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: "100%",
  },
  number: {
    textAlign: "right",
    justifyContent: "right",
  },
  text: {},
  tooltip: {
    // backgroundColor: theme.palette.common.white,
    // color: "red",
    boxShadow: theme.shadows[1],
    fontSize: 12,
    marginBottom: 0,
    padding: 7,
    maxWidth: 500,
  },
}));

function ConfigOption(props: ConfigOptionProps): React.ReactElement {
  const { configData, optionKey, state, stateDispatch, toggleSection, updateConfig } = props;
  const classes = useStyles();
  const optionData: IConfigOption = configData.get(optionKey) || { value: "", comment: "" };
  const [value, setValue] = useState(optionData.value);

  const inputType = /^[-.\d]+/.test(optionData.value) ? "number" : "text";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (event: any) => {
    const type = event.target.type;
    const newValue = type == "checkbox" ? (value == "true" ? "false" : "true") : event.target.value;

    configData.set(optionKey, { value: newValue, comment: optionData.comment });

    if (optionKey == "enabled" && type == "checkbox") {
      toggleSection(newValue == "true");
    }

    if (!state.configDirty) {
      stateDispatch({ type: "setConfigDirty", payload: true });
    }

    setValue(newValue);

    // Using setTimeout here for the update to be queued, which speeds up perceived input
    setTimeout(updateConfig, 10);
  };

  const getInputComponent = (): JSX.Element => {
    if (/(true|false)/i.test(value)) {
      return (
        <Switch
          checked={value == "true"}
          onChange={handleChange}
          name={optionKey}
          inputProps={{ "aria-label": "checkbox" }}
        />
      );
    }

    return (
      <InputBase
        type={inputType}
        inputProps={{ min: 0, style: { textAlign: "right" } }}
        id={optionKey}
        name={optionKey}
        defaultValue={value}
        onChange={handleChange}
        required={true}
      />
    );
  };

  return (
    <Tooltip
      key={optionKey}
      title={optionData.comment}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 600 }}
      classes={{ tooltip: classes.tooltip }}
      placement="top-end"
    >
      <Box className={classes.options}>
        <Typography>{optionKey}</Typography>
        <FormControl component="fieldset">
          <FormGroup aria-label="position" row>
            {getInputComponent()}
          </FormGroup>
        </FormControl>
      </Box>
    </Tooltip>
  );
}

ConfigOption.propTypes = {
  configData: PropTypes.object.isRequired,
  optionKey: PropTypes.string.isRequired,
  state: PropTypes.object.isRequired,
  stateDispatch: PropTypes.func.isRequired,
  toggleSection: PropTypes.func.isRequired,
  updateConfig: PropTypes.func.isRequired,
};

export default ConfigOption;
