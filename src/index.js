import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Importing the Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';

import App from "./App_v4";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
