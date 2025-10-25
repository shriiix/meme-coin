import { STROOPS_IN_ONE } from "./constants";

export const formatNumber = (num, decimals = 2) => {
  if (!num && num !== 0) return "0";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCurrency = (num, currency = "XLM") => {
  if (!num && num !== 0) return `0 ${currency}`;
  return `${formatNumber(num, 2)} ${currency}`;
};

export const formatAddress = (address, startChars = 4, endChars = 4) => {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.substring(0, startChars)}...${address.substring(
    address.length - endChars
  )}`;
};

export const stroopsToXLM = (stroops) => {
  return Number(stroops) / STROOPS_IN_ONE;
};

export const xlmToSroops = (xlm) => {
  return Math.floor(Number(xlm) * STROOPS_IN_ONE);
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

export const formatPercentage = (value) => {
  return `${value >= 0 ? "+" : ""}${formatNumber(value, 2)}%`;
};
