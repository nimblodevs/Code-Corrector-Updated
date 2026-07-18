import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- shadcn UI helper ---
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- HMS Status Configurations ---
export const STATUS_META = {
  Queued: { color: "#c2410c", bg: "#ffedd5", dot: "#f97316" },
  Triaged: { color: "#b45309", bg: "#fef9c3", dot: "#eab308" },
  Registered: { color: "#1d4ed8", bg: "#dbeafe", dot: "#3b82f6" },
  Billed: { color: "#6b21a8", bg: "#f3e8ff", dot: "#a855f7" },
  "With Doctor": { color: "#7e22ce", bg: "#f3e8ff", dot: "#a855f7" },
  "Lab Pending": { color: "#a21caf", bg: "#fdf4ff", dot: "#d946ef" },
  Admitted: { color: "#b91c1c", bg: "#fee2e2", dot: "#ef4444" },
  "Pending Admission": { color: "#0369a1", bg: "#e0f2fe", dot: "#0ea5e9" },
  Completed: { color: "#15803d", bg: "#dcfce7", dot: "#22c55e" },
};

// --- HMS Icons Emoji Map ---
export const ICON_EMOJI = {
  queue: "📋",
  triage: "🩺",
  register: "📝",
  doctor: "🩺",
  lab: "🧪",
  pharmacy: "💊",
  ward: "🛏",
  history: "📁",
  analytics: "📊",
  reports: "📋",
  finance: "💳",
  schemes: "💳",
  inventory: "📦",
  procurement: "🛒",
  catalogue: "📑",
  forecast: "📈",
  transfers: "🔄",
  expiry: "⚠️",
};

export const emojiOf = (code) => ICON_EMOJI[code] || code;

// --- HMS Core Navigation Layout ---
export const NAV = [
  { key: "queue", label: "Queue", emoji: "queue" },
  { key: "triage", label: "Triage", emoji: "triage" },
  { key: "register", label: "Register", emoji: "register" },
  { key: "doctor", label: "Doctor", emoji: "doctor" },
  { key: "lab", label: "Lab", emoji: "lab" },
  { key: "pharmacy", label: "Pharmacy", emoji: "pharmacy" },
  { key: "ward", label: "Ward", emoji: "ward" },
  { key: "history", label: "History", emoji: "history" },
  { key: "analytics", label: "Analytics", emoji: "analytics" },
  { key: "reports", label: "Reports", emoji: "reports" },
  { key: "finance", label: "Finance", emoji: "finance" },
  { key: "schemes", label: "Schemes", emoji: "schemes" },
  { key: "inventory", label: "Inventory", emoji: "inventory" },
  { key: "procurement", label: "Procurement", emoji: "procurement" },
  { key: "catalogue", label: "Catalogue", emoji: "catalogue" },
  { key: "forecast", label: "Forecast", emoji: "forecast" },
  { key: "transfers", label: "Transfers", emoji: "transfers" },
  { key: "expiry", label: "Expiry", emoji: "expiry" },
];

// --- HMS Helpers & Utility Methods ---
export const genNo = (prefix, num) => {
  const val = num !== undefined ? num : Math.floor(1000 + Math.random() * 9000);
  const padded = String(val).padStart(4, "0");
  return `${prefix}-${padded}`;
};

export const CASH_METHODS = ["Cash", "M-Pesa", "Credit Card", "Debit Card", "Mobile Money"];
export const SCHEME_METHODS = ["NHIF", "Insurance", "Corporate", "Corporate Account", "Scheme"];

export const checkPharmCleared = (p) => {
  if (!p) return { cleared: false, reason: "No patient specified." };
  if (p.category && p.category !== "Cash") {
    return { cleared: true, reason: `Cleared under credit category: ${p.category}` };
  }
  if (p.billing?.paid) {
    return { cleared: true, reason: "Payment verified." };
  }
  return { cleared: false, reason: "Invoice is unpaid. Cash patients must clear billing first." };
};

export const todayStr = () => new Date().toISOString().split("T")[0];
export const timeNow = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const pad = (num, size) => {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
};

export const calcAge = (dobString) => {
  if (!dobString) return 0;
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
};

export const fmtN = (num) => {
  const val = parseFloat(num);
  return isNaN(val) ? "0" : val.toLocaleString();
};

export const avatarHue = (str) => {
  if (!str) return 200;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};
