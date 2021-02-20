import { createMuiTheme } from "@material-ui/core/styles";
import { red, grey } from "@material-ui/core/colors";

export default createMuiTheme({
  palette: {
    primary: {
      main: grey[800]
    },
    secondary: {
      main: red[500]
    },
    background: {
      default: grey[200]
    }
  },
  typography: {
    fontSize: 12
  }
});
