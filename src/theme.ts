import { createMuiTheme } from '@material-ui/core/styles';

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    gameColor: {
      blue: string;
      red: string;
      bystander: string;
      assassin: string;
      unknown: string;
    };
  }
  interface ThemeOptions {
    gameColor: {
      blue: string;
      red: string;
      bystander: string;
      assassin: string;
      unknown: string;
    };
  }
}

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
  gameColor: {
    blue: 'lightBlue',
    red: 'lightCoral',
    bystander: 'grey',
    assassin: 'black',
    unknown: 'lightYellow',
  },
});

export default theme;
