import * as StellarSdk from "stellar-sdk";
import { STELLAR_CONFIG } from "../config/stellar.config";

export const createServer = () => {
  return new StellarSdk.rpc.Server(STELLAR_CONFIG.sorobanRpcUrl);
};

export const createHorizonServer = () => {
  return new StellarSdk.Horizon.Server(STELLAR_CONFIG.horizonUrl);
};

export const getNetworkPassphrase = () => {
  return STELLAR_CONFIG.networkPassphrase;
};

export const isValidStellarAddress = (address) => {
  try {
    StellarSdk.StrKey.decodeEd25519PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

export const scValToNative = (scVal) => {
  return StellarSdk.scValToNative(scVal);
};

export const nativeToScVal = (value, type) => {
  return StellarSdk.nativeToScVal(value, { type });
};

export const addressToScVal = (address) => {
  return new StellarSdk.Address(address).toScVal();
};
