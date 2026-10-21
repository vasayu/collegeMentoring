import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import store from "./store/store.ts";
import { Provider } from "react-redux";

createRoot( document.getElementById( "root" )! ).render(
  <StrictMode>
    <Provider store={ store }>


      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </StrictMode>
);
