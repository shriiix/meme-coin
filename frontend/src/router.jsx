import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";
import CreateToken from "./components/token/CreateToken";
import TokenDetails from "./components/token/TokenDetails";
import WalletConnect from "./components/auth/WalletConnect";
import { useWallet } from "./context/WalletContext";

export default function AppRouter() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return <WalletConnect />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateToken />} />
        <Route path="/token/:id" element={<TokenDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
