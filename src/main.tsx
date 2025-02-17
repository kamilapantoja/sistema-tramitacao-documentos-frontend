import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { PrimeReactProvider } from "primereact/api";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { HashRouter } from "react-router";
import App from "./App";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <PrimeReactProvider>
            <HashRouter>
                <App />
            </HashRouter>
        </PrimeReactProvider>
    </StrictMode>
);
