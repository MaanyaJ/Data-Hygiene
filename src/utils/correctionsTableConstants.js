export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

export const SELECTED = { accent: "#2563eb", light: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" };
export const ACCEPTED = { accent: "#16a34a", light: "#f0fdf4", border: "#bbf7d0", text: "#15803d" };

export const STATUS = {
  ACCEPTED: "accepted",
  APPROVED: "approved",
  ON_HOLD: "on hold",
  L0_DATA: "l0 data",
  INVALID: "invalid",
};
