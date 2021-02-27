import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
// import PropTypes from "prop-types";
import React from "react";

// interface ILoadingPageProps {
//   handleClick: (event: React.MouseEvent | null) => void;
// }

const useStyles = makeStyles((theme) => ({
  listItem: {
    backgroundColor: theme.palette.background.paper,
    cursor: "pointer",
    margin: "5px 0px",
    borderRadius: 5,
  },
  loadingText: {
    display: "block",
    margin: "auto",
    marginTop: 200,
    textAlign: "center",
  },
  loadingIcon: {
    display: "block",
    margin: "auto",
    marginTop: 25,
  },
}));

function LoadingPage(): React.ReactElement {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography variant="h5" className={classes.loadingText}>
        Loading... Please wait
      </Typography>
      <CircularProgress className={classes.loadingIcon} color="secondary" />
    </React.Fragment>
  );
}

// LoadingPage.propTypes = {
//  handleClick: PropTypes.func.isRequired,
//};

export default LoadingPage;
