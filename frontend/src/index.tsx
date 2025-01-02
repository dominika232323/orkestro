import {GoogleOAuthProvider} from "@react-oauth/google";
import ReactDOM from "react-dom/client";
import React from "react";

import "./i18n";
import "./index.css";

import {LanguageProvider} from "./LanguageContext";
import App from "./App";


const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(
    <React.StrictMode>
        <LanguageProvider>
            <GoogleOAuthProvider
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}
            >
                <App/>
            </GoogleOAuthProvider>
        </LanguageProvider>
    </React.StrictMode>
);
