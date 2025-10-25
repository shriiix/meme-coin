import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export class APIService {
  static async getTokens() {
    try {
      const response = await api.get("/tokens");
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  static async getToken(tokenId) {
    try {
      const response = await api.get(`/tokens/${tokenId}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  static async getTrades(tokenId) {
    try {
      const response = await api.get(`/trades/${tokenId}`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  static async getUserTrades(address) {
    try {
      const response = await api.get(`/users/${address}/trades`);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
}
