import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@emotion/react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { esES as dataGridEsES } from "@mui/x-data-grid";
import { esES } from "@mui/x-date-pickers/locales";

import App from "./App.tsx";
import { store } from "./redux/store.ts";

import "./main.css";

const defaultTheme = createTheme({}, esES, dataGridEsES);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={defaultTheme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
