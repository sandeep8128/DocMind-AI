import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    // Agar already loaded hai
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      console.log("✅ Razorpay Checkout loaded");
      resolve(true);
    };

    script.onerror = () => {
      console.error("❌ Failed to load Razorpay Checkout");
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

loadRazorpay();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
