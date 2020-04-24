import React from "react";
import ReactDOM from "react-dom";
import CssBaseLine from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import { applyMiddleware, createStore } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import theme from './theme';
import reducer, { initialState } from "./store/reducer";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

const composeEnhancers = composeWithDevTools({});
const store = createStore(
  reducer,
  initialState,
  composeEnhancers(applyMiddleware(thunk))
);

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseLine />
      <App />
    </ThemeProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
