import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { esES } from "@mui/x-data-grid";

import App from "./App.tsx";
import { store } from "./redux/store.ts";

import "./main.css";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@emotion/react";

const defaultTheme = createTheme({}, esES);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={defaultTheme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
