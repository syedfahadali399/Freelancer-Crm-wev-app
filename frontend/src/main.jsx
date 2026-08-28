import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { StrictMode } from "react";
import App from "./App.jsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(

  <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StrictMode>
          <App />
          <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
        </StrictMode>
      </BrowserRouter>
  </QueryClientProvider>
  
);
