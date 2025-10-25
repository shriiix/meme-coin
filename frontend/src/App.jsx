import React from "react";
import { BrowserRouter } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import { TokenProvider } from "./context/TokenContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRouter from "./router";
import Toast from "./components/common/Toast";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <WalletProvider>
          <TokenProvider>
            <AppRouter />
            <Toast />
          </TokenProvider>
        </WalletProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
