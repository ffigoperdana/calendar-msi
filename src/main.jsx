import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { gapi } from "gapi-script";
import { AuthProvider } from "./context/AuthProvider";
import './index.css';

const container = document.getElementById("root");
const root = createRoot(container);

const initClient = () => {
  gapi.client.init({
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
    scope: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send",
    cookiepolicy: 'single_host_origin'
  }).then(() => {
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );
  }, (error) => {
    console.error("Error initializing Google API client: ", error);
  });
};

gapi.load("client:auth2", initClient);
