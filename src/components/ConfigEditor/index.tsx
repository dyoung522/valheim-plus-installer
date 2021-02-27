import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";

interface ConfigEditorProps {
  state: IState;
  stateDispatch: StateDispatch;
}

const useStyles = makeStyles((theme) => ({
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

  return (
    <Card className={classes.card}>
      <Typography variant="h4">CFG Editor Coming Soon</Typography>
      <Typography className={classes.quitMessage}>You can now safely close this application</Typography>
    </Card>
  );
}

export default ConfigEditor;
