import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ChatProvider } from "./context/chatContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
      <BrowserRouter>
    <ChatProvider>
        <App />
    </ChatProvider>
      </BrowserRouter>
  </StrictMode>
);
