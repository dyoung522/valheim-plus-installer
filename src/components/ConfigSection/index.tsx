import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@material-ui/core/Box";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ConfigOption from "components/ConfigOption";

type ConfigOption = { value: string; comment: string };
interface ConfigSectionProps {
  configData: Map<string, IConfigOption>;
  section: string;
  state: IState;
  stateDispatch: StateDispatch;
  updateConfig: () => void;
}

const useStyles = makeStyles((theme) => ({
  expandIcon: {
    flexDirection: "row-reverse",
    marginLeft: 0,
    paddingLeft: 0,
  },
  sectionEnabled: {
    textTransform: "uppercase",
    fontWeight: theme.typography.fontWeightBold,
    marginLeft: theme.spacing(1),
  },
  sectionDisabled: {
    textTransform: "uppercase",
    fontWeight: theme.typography.fontWeightRegular,
    marginLeft: theme.spacing(1),
    color: "gray",
  },
  options: {
    display: "flex",
    flexFlow: "row wrap",
    justifyContent: "space-between",
    padding: theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: "100%",
  },
  optionsContainer: {
    display: "flex",
    flexFlow: "row wrap",
    justifyContent: "space-between",
    width: "100%",
  },
}));

function ConfigSection(props: ConfigSectionProps): React.ReactElement {
  const { section, configData, state, stateDispatch, updateConfig } = props;
  const classes = useStyles();

  const [enabled, setEnabled] = useState(configData.get("enabled")?.value == "true")

  const toggleSection = (state: boolean) => setEnabled(state);

  const sectionOptions: JSX.Element[] = [];
  const sectionClass = enabled ? classes.sectionEnabled : classes.sectionDisabled;

  Array.from(configData.keys()).map((key: string) => {
    sectionOptions.push(
      <ConfigOption
        key={key}
        configData={configData}
        optionKey={key}
        state={state}
        stateDispatch={stateDispatch}
        toggleSection={toggleSection}
        updateConfig={updateConfig}
      />
    );
  });

  return (
    <Accordion>
      <AccordionSummary
        className={classes.expandIcon}
        expandIcon={<ExpandMoreIcon />}
        aria-controls={section}
        id={section}
      >
        <Box className={classes.optionsContainer}>
          <Typography className={sectionClass}>{section}</Typography>
          <Typography className={sectionClass}>{enabled ? "enabled" : "disabled"}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box className={classes.optionsContainer}>{sectionOptions}</Box>
      </AccordionDetails>
    </Accordion>
  );
}

ConfigSection.propTypes = {
  configData: PropTypes.object.isRequired,
  section: PropTypes.string.isRequired,
  state: PropTypes.object.isRequired,
  stateDispatch: PropTypes.func.isRequired,
  updateConfig: PropTypes.func.isRequired,
};

export default ConfigSection;
